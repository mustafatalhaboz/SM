import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, OPENAI_CONFIG } from '@/lib/openai-client';
import { processTranscriptResponse } from '@/lib/transcript-parser';
import { logger } from '@/lib/logger';
import { 
  AnalyzeTranscriptRequest, 
  AnalyzeTranscriptResponse, 
  AgentErrorType,
  ProcessedTaskDataAPI 
} from '@/types/agent';

export async function POST(request: NextRequest) {
  try {
    logger.debug('Agent API: Analyze transcript request received', {} as Record<string, unknown>);
    
    // Parse request body
    const body: AnalyzeTranscriptRequest = await request.json();
    const { transcript, projects } = body;
    
    // Validate input
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      logger.error('Agent API: Invalid transcript', { transcript } as Record<string, unknown>);
      return NextResponse.json<AnalyzeTranscriptResponse>({
        success: false,
        error: {
          type: AgentErrorType.VALIDATION_ERROR,
          message: 'Metin boş veya geçersiz'
        }
      }, { status: 400 });
    }
    
    if (!projects || !Array.isArray(projects)) {
      logger.error('Agent API: Invalid projects array', { projects } as Record<string, unknown>);
      return NextResponse.json<AnalyzeTranscriptResponse>({
        success: false,
        error: {
          type: AgentErrorType.VALIDATION_ERROR,
          message: 'Proje listesi geçersiz'
        }
      }, { status: 400 });
    }
    
    logger.debug('Agent API: Input validated', { 
      transcriptLength: transcript.length,
      projectCount: projects.length
    } as Record<string, unknown>);
    
    // Get current date for AI context
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS months are 0-based
    const currentDay = now.getDate();
    const currentDateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
    
    // Prepare enhanced AI prompt with command type detection
    const systemPrompt = `Sen bir gelişmiş görev yönetim asistanısın. Türkçe ve İngilizce karışık ses kayıtlarından hem YENİ görev oluşturma hem de MEVCUT görev güncelleme komutlarını anlıyorsun.

BUGÜNÜN TARİHİ: ${currentDateStr} (${currentYear} yılı)

KOMUT TİPLERİ:
1. CREATE: Yeni görev oluştur ("yeni task", "görev ekle", "task oluştur")
2. UPDATE: Mevcut görevi güncelle ("değiştir", "güncelle", "düzenle")
3. COMPLETE: Görevi tamamlandı işaretle ("yapıldı", "tamamlandı", "bitti")

Lütfen aşağıdaki JSON formatında yanıt ver:

CREATE komutu için:
{
  "commandType": "CREATE",
  "title": "Görev başlığı (zorunlu)",
  "description": "Açıklama (opsiyonel)",
  "projectName": "Proje ismi",
  "assignedPerson": "Atanan kişi", 
  "priority": "Yüksek|Orta|Düşük",
  "type": "Operasyon|Yönlendirme|Takip",
  "estimatedDuration": "15dk|30dk|1saat|1.5saat|2saat",
  "deadline": "Tarih (YYYY-MM-DD)",
  "confidence": 0.95
}

UPDATE komutu için:
{
  "commandType": "UPDATE",
  "taskIdentification": {
    "projectName": "Proje ismi",
    "taskName": "Güncellenecek görev ismi"
  },
  "updateFields": {
    "title": "Yeni başlık (eğer değişecekse)",
    "description": "Yeni açıklama (eğer değişecekse)",
    "status": "Yeni durum (eğer değişecekse)",
    "priority": "Yeni öncelik (eğer değişecekse)",
    "estimatedDuration": "Yeni süre (eğer değişecekse)",
    "deadline": "Yeni tarih (eğer değişecekse)",
    "assignedPerson": "Yeni atanan (eğer değişecekse)"
  },
  "confidence": 0.95
}

COMPLETE komutu için:
{
  "commandType": "COMPLETE",
  "taskIdentification": {
    "projectName": "Proje ismi",
    "taskName": "Tamamlanan görev ismi"
  },
  "confidence": 0.95
}

Mevcut projeler: ${projects.map(p => p.name).join(', ')}

KOMUT ÖRNEKLER:
- CREATE: "Valtemo projesine yeni tasarım görevi ekle"
- UPDATE: "Website projesindeki dashboard task'ının önceliğini yüksek yap"
- UPDATE: "API projesindeki login task'ının açıklamasını güncellenmiş API dökümantasyonu olarak değiştir"
- COMPLETE: "Blog projesindeki content task'ını yapıldı olarak işaretle"

TARİH KURALLARI:
1. Yıl belirtilmeyen tarihler için MUTLAKA ${currentYear} yılını kullan
2. "22 ağustos" = "${currentYear}-08-22"
3. "yarın" = bugünden 1 gün sonra
4. "gelecek hafta" = bugünden 7 gün sonra

GENEL KURALLAR:
1. commandType her zaman belirlenmeli
2. CREATE için title zorunlu, UPDATE için taskIdentification zorunlu
3. UPDATE'te sadece değişecek field'ları updateFields'a ekle
4. Proje ismi mevcut projelerle eşleştirilmeli
5. confidence 0-1 arası
6. Sadece JSON yanıtı ver`;

    const userPrompt = `Ses kaydı metni: "${transcript.trim()}"`;
    
    logger.debug('Agent API: Calling OpenAI', {
      model: OPENAI_CONFIG.model,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length
    } as Record<string, unknown>);
    
    // Call OpenAI API
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      ...OPENAI_CONFIG,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });
    
    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      logger.error('Agent API: Empty OpenAI response', {} as Record<string, unknown>);
      return NextResponse.json<AnalyzeTranscriptResponse>({
        success: false,
        error: {
          type: AgentErrorType.OPENAI_API_ERROR,
          message: 'AI servisi boş yanıt döndü'
        }
      }, { status: 500 });
    }
    
    logger.debug('Agent API: OpenAI response received', {
      responseLength: aiResponse.length,
      usage: completion.usage
    } as Record<string, unknown>);
    
    // Process AI response
    const commandResult = await processTranscriptResponse(aiResponse, projects);
    
    logger.debug('Agent API: Response processed successfully', {
      commandType: commandResult.commandType
    } as Record<string, unknown>);
    
    // For backward compatibility, return ProcessedTaskDataAPI for CREATE commands
    if (commandResult.commandType === 'CREATE' && commandResult.createData) {
      const apiData: ProcessedTaskDataAPI = {
        ...commandResult.createData,
        deadline: commandResult.createData.deadline.toISOString() // Convert Date to string
      };
      
      return NextResponse.json<AnalyzeTranscriptResponse>({
        success: true,
        data: apiData
      });
    }
    
    // For UPDATE and COMPLETE commands, return the command result directly
    // We'll handle these in the hook layer
    return NextResponse.json({
      success: true,
      commandResult
    });
    
  } catch (error) {
    logger.error('Agent API: Unexpected error', { error } as Record<string, unknown>);
    
    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'insufficient_quota':
          return NextResponse.json<AnalyzeTranscriptResponse>({
            success: false,
            error: {
              type: AgentErrorType.OPENAI_API_ERROR,
              message: 'AI servisi kotası doldu'
            }
          }, { status: 503 });
          
        case 'rate_limit_exceeded':
          return NextResponse.json<AnalyzeTranscriptResponse>({
            success: false,
            error: {
              type: AgentErrorType.OPENAI_API_ERROR,
              message: 'Çok fazla istek - lütfen bekleyin'
            }
          }, { status: 429 });
          
        case 'invalid_api_key':
          return NextResponse.json<AnalyzeTranscriptResponse>({
            success: false,
            error: {
              type: AgentErrorType.OPENAI_API_ERROR,
              message: 'AI servisi yapılandırma hatası'
            }
          }, { status: 500 });
      }
    }
    
    // Generic error
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json<AnalyzeTranscriptResponse>({
      success: false,
      error: {
        type: AgentErrorType.UNKNOWN,
        message: errorMessage
      }
    }, { status: 500 });
  }
}