# 🤖 SmartOCR Pro - LangGraph AI 명세서

---

## 🎯 LangGraph 시스템 개요

LangGraph는 SmartOCR Pro의 핵심 AI 엔진으로, PDF에서 추출된 텍스트를 고품질로 보정하고 다양한 형태로 변환하는 역할을 담당합니다.

### 🏗️ 아키텍처 구조
```
Frontend ←→ Backend ←→ Shared Storage ←→ LangGraph API ←→ OpenAI GPT-4
             ↓                ↑                      ←→ Translation APIs
         WebSocket      Metadata Files              ←→ Text Processing Tools
       (실시간 진행률)   (진행 상태 추적)
```

### 📁 파일 기반 처리 흐름
1. **Backend**: PDF를 공유 스토리지에 저장
2. **LangGraph**: 파일 경로와 메타데이터만 수신
3. **Processing**: 텍스트 청크별로 AI 처리
4. **Tracking**: metadata.json으로 진행 상태 추적
5. **Frontend**: WebSocket으로 실시간 업데이트

---

## 🔄 LangGraph 워크플로우 설계

### 📊 Main OCR Processing Graph

```python
# 주요 처리 단계
workflow = StateGraph(OCRState)

# 노드 정의
workflow.add_node("extract_text", extract_pdf_text)
workflow.add_node("chunk_text", chunk_large_text)
workflow.add_node("analyze_quality", analyze_text_quality) 
workflow.add_node("correct_chunks", correct_text_chunks)
workflow.add_node("validate_quality", validate_correction_quality)
workflow.add_node("translate_text", translate_if_needed)
workflow.add_node("finalize_output", merge_and_format)

# 엣지 정의 (조건부 라우팅)
workflow.add_conditional_edges(
    "analyze_quality",
    decide_processing_strategy,
    {
        "high_quality": "finalize_output",      # 품질 좋음 → 바로 완료
        "medium_quality": "correct_chunks",     # 보통 → AI 보정
        "low_quality": "correct_chunks",        # 나쁨 → AI 보정
        "too_large": "chunk_text"               # 너무 큼 → 분할 처리
    }
)

workflow.add_conditional_edges(
    "validate_quality",
    decide_next_action,
    {
        "translation_needed": "translate_text",
        "output_ready": "finalize_output",
        "retry_correction": "correct_chunks"
    }
)
```

### 🧠 OCR State 정의
```python
from typing import TypedDict, List, Optional

class OCRState(TypedDict):
    # 🔑 메타데이터 (HTTP로 전송)
    process_id: str
    file_path: str
    user_options: dict
    
    # 📊 처리 상태
    current_step: str
    progress: int
    quality_score: Optional[float]
    chunk_count: int
    completed_chunks: int
    
    # 📈 성능 메트릭
    confidence_score: Optional[float]
    error_count: Optional[int]
    processing_time: Optional[float]
    estimated_remaining: Optional[int]
    
    # 🚨 에러 및 로그
    errors: List[str]
    logs: List[str]
    
    # 🎯 처리 옵션
    enable_translation: bool
    target_language: Optional[str]
    quality_level: str  # 'low', 'medium', 'high'
```

---

## 🔧 LangGraph 노드 상세 정의

### 1️⃣ extract_pdf_text 노드
```python
def extract_pdf_text(state: OCRState) -> OCRState:
    """PDF에서 텍스트 추출"""
    
    # pdftotext 라이브러리 사용
    raw_text = extract_with_pdftotext(state["file_path"])
    
    return {
        **state,
        "raw_text": raw_text,
        "current_step": "extraction_complete",
        "progress": 20
    }
```

### 2️⃣ analyze_quality 노드
```python
def analyze_quality(state: OCRState) -> OCRState:
    """텍스트 품질 분석"""
    
    prompt = """
    Please evaluate the quality of the following text on a scale of 0-100.
    Evaluation criteria:
    - Grammatical accuracy
    - Completeness of sentence structure  
    - Typos and special character errors
    - Clarity of meaning
    
    Text: {text}
    
    Please return only the score as a number.
    """
    
    quality_score = llm_call(prompt, text=state["raw_text"])
    
    return {
        **state,
        "quality_score": float(quality_score),
        "current_step": "quality_analyzed", 
        "progress": 40
    }
```

### 3️⃣ correct_errors 노드
```python
def correct_errors(state: OCRState) -> OCRState:
    """AI 기반 텍스트 오류 수정"""
    
    correction_prompt = """
    The following is text extracted from a PDF. Please correct these errors:

    1. Incorrect character recognition due to OCR extraction errors
    2. Missing or excessive spaces between words
    3. Punctuation errors
    4. Word separation due to line break errors
    5. Special character misrecognition
    
    Please correct to natural language while preserving the original meaning.
    Detect the language automatically and respond in the same language.
    
    Original text:
    {raw_text}
    
    Please return only the corrected text.
    """
    
    corrected_text = llm_call(
        correction_prompt, 
        raw_text=state["raw_text"]
    )
    
    return {
        **state,
        "corrected_text": corrected_text,
        "current_step": "errors_corrected",
        "progress": 70
    }
```

### 4️⃣ format_output 노드
```python
def format_output(state: OCRState) -> OCRState:
    """출력 형식 포맷팅"""
    
    text_to_format = state.get("corrected_text") or state["raw_text"]
    
    # 사용자 옵션에 따른 포맷팅
    options = state["user_options"]
    
    if options.get("preserve_structure"):
        formatted_text = preserve_document_structure(text_to_format)
    else:
        formatted_text = clean_text_format(text_to_format)
    
    return {
        **state,
        "formatted_text": formatted_text,
        "current_step": "formatting_complete",
        "progress": 80
    }
```

### 5️⃣ translate_text 노드 (조건부)
```python
def translate_text(state: OCRState) -> OCRState:
    """텍스트 번역 (선택사항)"""
    
    if not state["user_options"].get("enable_translation"):
        return state
    
    target_language = state["user_options"]["target_language"]
    source_text = state["formatted_text"]
    
    translation_prompt = f"""
    Please translate the following text to {target_language} naturally.
    Provide professional and accurate translation.
    
    Text: {source_text}
    """
    
    translated_text = llm_call(translation_prompt)
    
    return {
        **state,
        "translated_text": translated_text,
        "current_step": "translation_complete",
        "progress": 90
    }
```

### 6️⃣ generate_outputs 노드
```python
def generate_outputs(state: OCRState) -> OCRState:
    """최종 출력 파일 생성"""
    
    outputs = []
    requested_formats = state["user_options"]["output_formats"]
    
    # 텍스트 출력
    if "text" in requested_formats:
        text_output = {
            "type": "text",
            "content": state["formatted_text"],
            "filename": f"{state['process_id']}_result.txt"
        }
        outputs.append(text_output)
    
    # PDF 출력
    if "pdf" in requested_formats:
        pdf_path = generate_pdf_from_text(
            state["formatted_text"], 
            state["process_id"]
        )
        pdf_output = {
            "type": "pdf", 
            "file_path": pdf_path,
            "filename": f"{state['process_id']}_result.pdf"
        }
        outputs.append(pdf_output)
    
    # 번역본 출력
    if "translation" in requested_formats and state.get("translated_text"):
        translation_output = {
            "type": "translation",
            "content": state["translated_text"], 
            "language": state["user_options"]["target_language"],
            "filename": f"{state['process_id']}_translation.txt"
        }
        outputs.append(translation_output)
    
    return {
        **state,
        "outputs": outputs,
        "current_step": "completed",
        "progress": 100
    }
```

---

## 🔀 조건부 라우팅 로직

### 품질 기반 처리 분기
```python
def decide_correction_level(state: OCRState) -> str:
    """텍스트 품질에 따른 처리 경로 결정"""
    
    quality_score = state["quality_score"]
    
    if quality_score >= 85:
        return "high_quality"  # 바로 포맷팅
    elif quality_score >= 60:
        return "medium_quality"  # 기본 수정
    else:
        return "low_quality"  # 강화된 수정
```

### 에러 처리 및 재시도 로직
```python
def handle_processing_error(state: OCRState) -> str:
    """처리 중 에러 발생 시 처리"""
    
    error_count = len(state.get("errors", []))
    
    if error_count < 3:
        return "retry"
    else:
        return "failed"
```

---

## 🌐 LangGraph API 엔드포인트

### 📡 OCR 처리 시작
```python
@app.post("/api/langgraph/process")
async def start_ocr_process(request: OCRRequest):
    """OCR 처리 시작"""
    
    initial_state = {
        "file_path": request.file_path,
        "process_id": request.process_id,
        "user_options": request.options,
        "current_step": "initialized",
        "progress": 0,
        "errors": []
    }
    
    # LangGraph 워크플로우 실행
    result = await workflow.ainvoke(initial_state)
    
    return {
        "success": True,
        "process_id": request.process_id,
        "estimated_time": calculate_estimated_time(request.options)
    }
```

### 📊 처리 상태 조회
```python
@app.get("/api/langgraph/status/{process_id}")
async def get_process_status(process_id: str):
    """처리 상태 조회"""
    
    # Redis나 메모리에서 현재 상태 조회
    state = get_process_state(process_id)
    
    return {
        "process_id": process_id,
        "status": state.get("current_step", "unknown"),
        "progress": state.get("progress", 0),
        "estimated_time_remaining": calculate_remaining_time(state)
    }
```

### 📥 처리 결과 조회
```python
@app.get("/api/langgraph/result/{process_id}")
async def get_process_result(process_id: str):
    """처리 결과 조회"""
    
    state = get_final_state(process_id)
    
    if state.get("current_step") != "completed":
        raise HTTPException(404, "Processing not completed")
    
    return {
        "process_id": process_id,
        "outputs": state["outputs"],
        "processing_time": state.get("processing_time"),
        "confidence_score": state.get("confidence_score")
    }
```

---

## ⚙️ LangGraph 설정 및 환경

### 🤖 LLM 모델 설정
```python
from langchain_openai import ChatOpenAI

# 주요 처리용 GPT-4
primary_llm = ChatOpenAI(
    model="gpt-4-turbo-preview",
    temperature=0.1,  # 일관성을 위해 낮게 설정
    max_tokens=4000,
    timeout=60
)

# 빠른 처리용 GPT-3.5
fast_llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.1,
    max_tokens=2000,
    timeout=30
)
```

### 🔧 처리 옵션 스키마
```python
class OCROptions(BaseModel):
    """OCR processing options"""
    
    language: str = "auto"  # Source language (auto-detect)
    output_formats: List[str] = ["text"]  # Output formats
    preserve_structure: bool = True  # Preserve document structure
    correction_level: str = "auto"  # Correction intensity (auto/light/heavy)
    
    # Translation options
    enable_translation: bool = False
    target_language: str = "en"  # Target language for translation
    
    # Advanced options
    remove_headers_footers: bool = False
    merge_paragraphs: bool = False
    custom_instructions: Optional[str] = None
    
    # Supported languages
    supported_languages: List[str] = [
        "en", "es", "fr", "de", "ja", "zh", "ko", "pt", "it", "ru"
    ]
```

---

## 📊 성능 최적화 및 모니터링

### 🚀 처리 속도 최적화
- **병렬 처리**: 독립적인 노드들의 동시 실행
- **모델 캐싱**: 자주 사용되는 프롬프트 결과 캐싱
- **청크 처리**: 대용량 텍스트의 분할 처리

### 📈 메트릭 수집
```python
# 처리 시간 메트릭
processing_time_histogram = Histogram(
    'ocr_processing_duration_seconds',
    'OCR processing duration'
)

# 품질 점수 메트릭  
quality_score_gauge = Gauge(
    'ocr_quality_score',
    'OCR output quality score'
)

# 에러율 메트릭
error_rate_counter = Counter(
    'ocr_processing_errors_total',
    'Total OCR processing errors'
)
```

### 🔍 로깅 및 디버깅
- **구조화된 로깅**: JSON 형태의 상세 로그
- **단계별 추적**: 각 노드의 입출력 기록
- **에러 추적**: 실패 지점과 원인 분석

---

## 🔐 보안 및 데이터 처리

### 🛡️ 보안 조치
- **API 키 관리**: 환경변수를 통한 안전한 키 관리
- **요청 검증**: 입력 데이터 무결성 검증
- **결과 암호화**: 민감한 처리 결과 암호화 저장

### 🗑️ 데이터 정리 정책
- **임시 파일**: 처리 완료 후 24시간 내 삭제
- **처리 상태**: 7일 후 자동 정리
- **로그 데이터**: 30일 보관 후 아카이브 