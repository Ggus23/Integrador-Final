import re
import json
from datetime import date
from typing import Dict, List, Optional
from collections import Counter

# ============================================================================
# 1. Definición de patrones para depresión, ansiedad y estrés
# ============================================================================

DEPRESION_PATRONES = {
    "tristeza": (r"\b(triste|deprimid[oa]|melancolí[oa]|desanimad[oa]|baj[oa] de ánimo|desganad[oa]|sin ganas)\b", 1.0),
    "desesperanza": (r"\b(desesperanz[oa]|sin esperanza|sin sentido|nada vale la pena|no hay salida)\b", 1.2),
    "fatiga": (r"\b(cansanci[oa]|cansad[oa]|agotamient[oa]|sin energía|fatigad[oa]|sin fuerzas)\b", 0.8),
    "inutilidad": (r"\b(inútil|fracasad[oa]|no valgo|no sirvo|incompetente)\b", 1.1),
    "cambios_sueno": (r"\b(insomnio|duermo mucho|hipersomnia|despertar temprano|problemas de sueño|malos hábitos de sueño)\b", 0.9),
    "pensamientos_negativos": (r"\b(culpa|autocrític[oa]|odio a mí mismo|no merezco)\b", 1.0),
}

ANSIEDAD_PATRONES = {
    "nerviosismo": (r"\b(nervios[oa]|inquiet[oa]|tens[oa]|intranquil[oa]|agitad[oa]|ansios[oa]|ansiedad)\b", 1.0),
    "preocupacion": (r"\b(preocupad[oa]|angustiad[oa]|rumiando|pensando demasiado|anticipando lo peor)\b", 1.1),
    "miedo": (r"\b(miedo|temor|pánico|aterrorizad[oa]|fobia)\b", 1.2),
    "sintomas_fisicos": (r"\b(corazón acelerado|palpitaciones|sudor|temblor|falta de aire|opresión en el pecho|taquicardia)\b", 1.0),
    "evitacion": (r"\b(evito|escapo|no salgo|no quiero enfrentar)\b", 0.8),
    "hipervigilancia": (r"\b(alerta constante|sobresalt[oa]|asustadizo|vigilando todo)\b", 0.9),
}

ESTRES_PATRONES = {
    "sobrecarga": (r"\b(sobrecargad[oa]|abrumad[oa]|colmad[oa]|no puedo más|demasiadas cosas|estrés|estres[oa])\b", 1.2),
    "presion": (r"\b(presión|exigencia|plazos|obligaciones|debo hacer todo)\b", 1.0),
    "irritabilidad": (r"\b(irritable|enfadad[oa]|frustrad[oa]|pierdo la paciencia|me enojo fácil)\b", 1.0),
    "agotamiento": (r"\b(agotamient[oa]|quemad[oa]|burnout|sin motivación|desgaste)\b", 1.1),
    "problemas_concentracion": (r"\b(desconcentrad[oa]|olvidadizo|bloqueo mental|no puedo enfocarme)\b", 0.9),
    "cambios_apetito": (r"\b(como mucho|sin apetito|atracones|pierdo el hambre|no estoy comiendo|hábitos de alimentación)\b", 0.8),
}

# ============================================================================
# 2. Negaciones e intensificadores
# ============================================================================
NEGACIONES = {"no", "ni", "nunca", "jamás", "sin", "tampoco", "ningún", "ninguna"}
INTENSIFICADORES = {"muy", "mucho", "demasiado", "siempre", "constantemente", "extremadamente", "terriblemente"}

# Stopwords que hacen que una frase sea incompleta si están al final o inicio
STOPWORDS_ANALISIS = {
    "y", "e", "ni", "o", "u", "de", "del", "la", "las", "lo", "los",
    "el", "que", "por", "para", "con", "sin", "a", "ante", "bajo",
    "cabe", "contra", "desde", "durante", "en", "entre", "hacia",
    "hasta", "mediante", "para", "por", "según", "sin", "so", "sobre",
    "tras", "ya", "también", "tambien", "más", "pero", "aunque", "si", "no", 
    "me", "mi", "mis", "su", "sus", "te", "ti", "nos", "os",
    "creo", "que", "porque", "ultimamente", "últimamente", "así", "asi",
    "tan", "muy", "bastante", "un", "una", "unos", "unas"
}

# Compilación de patrones
def compilar_patrones(patrones_dict):
    compilados = {}
    for clave, (regex, peso) in patrones_dict.items():
        compilados[clave] = (re.compile(regex, re.IGNORECASE | re.UNICODE), peso)
    return compilados

DEPRESION_COMP = compilar_patrones(DEPRESION_PATRONES)
ANSIEDAD_COMP = compilar_patrones(ANSIEDAD_PATRONES)
ESTRES_COMP = compilar_patrones(ESTRES_PATRONES)

# ============================================================================
# 3. Clase DiaryAnalyzer (mejorada con extracción de frases con sentido)
# ============================================================================
class DiaryAnalyzer:
    def __init__(self, historial_path: Optional[str] = None, umbral_alerta: float = 0.6):
        self.historial_path = historial_path
        self.historial = []
        self.umbral_alerta = umbral_alerta
        if historial_path:
            self._cargar_historial()

    # ------------------------------------------------------------------------
    # Métodos públicos de compatibilidad (API antigua)
    # ------------------------------------------------------------------------
    def clean_and_tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        texto_limpio = self._limpiar_texto(text)
        return texto_limpio.split()

    def extract_bigrams(self, tokens: List[str], top_n: int = 10) -> Dict[str, int]:
        """Compatibilidad: ahora devuelve bigramas/trigramas con contenido emocional."""
        return self.extract_meaningful_phrases(tokens, top_n)

    def analyze_emotion(self, text: str) -> Dict:
        resultado = self.analizar_entrada(text)
        scores = resultado["scores"]
        max_score_cat = max(scores, key=scores.get)
        max_val = scores[max_score_cat]
        mapeo_emociones = {
            "depresion": "Triste",
            "ansiedad": "Ansioso",
            "estres": "Estresado"
        }
        emotion_label = "Neutral"
        if max_val >= 0.3:
            emotion_label = mapeo_emociones.get(max_score_cat, "Neutral")
        return {
            "emotion": emotion_label,
            "scores": scores,
            "sintomas": resultado["sintomas_detectados"],
            "alerta": resultado["alerta"]
        }

    # ------------------------------------------------------------------------
    # NUEVOS MÉTODOS PARA EXTRACCIÓN DE FRASES CON SENTIDO
    # ------------------------------------------------------------------------
    def get_key_concepts(self, text: str, top_n: int = 10) -> List[str]:
        """
        Extrae conceptos clave (frases cortas de 2-4 palabras) que contengan
        palabras emocionales, eliminando conectores innecesarios al inicio y final.
        """
        texto_limpio = self._limpiar_texto(text)
        tokens = texto_limpio.split()
        if len(tokens) < 2:
            return []

        posiciones_emocionales = set()
        for categoria in [DEPRESION_COMP, ANSIEDAD_COMP, ESTRES_COMP]:
            for _, (regex, _) in categoria.items():
                for match in regex.finditer(texto_limpio):
                    palabra_match = match.group(0)
                    for i, tok in enumerate(tokens):
                        if tok == palabra_match:
                            posiciones_emocionales.add(i)

        frases_candidatas = []
        for pos in posiciones_emocionales:
            # Ventana reducida para conceptos clave (máximo 4 palabras)
            inicio = max(0, pos - 1)
            fin = min(len(tokens), pos + 2) 
            
            ventana_tokens = tokens[inicio:fin]
            
            # Limpiar stopwords de los extremos para que la frase tenga sentido
            while ventana_tokens and ventana_tokens[0] in STOPWORDS_ANALISIS:
                ventana_tokens.pop(0)
            while ventana_tokens and ventana_tokens[-1] in STOPWORDS_ANALISIS:
                ventana_tokens.pop()

            if len(ventana_tokens) >= 2:
                frase = " ".join(ventana_tokens)
                frases_candidatas.append(frase)

        contador = Counter(frases_candidatas)
        return [frase for frase, _ in contador.most_common(top_n)]

    def extract_meaningful_phrases(self, tokens: List[str], top_n: int = 10) -> Dict[str, int]:
        """
        Genera bigramas y trigramas que contengan al menos una palabra emocional
        y que no terminen en una stopword vacía (como "y", "de", "que").
        Ideal para "PATRONES RECURRENTES".
        """
        if len(tokens) < 2:
            return {}

        frases_candidatas = []

        # Bigramas
        for i in range(len(tokens) - 1):
            bigrama = f"{tokens[i]} {tokens[i+1]}"
            if self._contiene_emocion(bigrama):
                if tokens[i+1] not in STOPWORDS_ANALISIS:
                    frases_candidatas.append(bigrama)

        # Trigramas
        for i in range(len(tokens) - 2):
            trigrama = f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}"
            if self._contiene_emocion(trigrama):
                if tokens[i+2] not in STOPWORDS_ANALISIS:
                    frases_candidatas.append(trigrama)

        contador = Counter(frases_candidatas)
        return dict(contador.most_common(top_n))

    def extraer_frases_relevantes(self, texto: str, top_n: int = 10) -> Dict[str, int]:
        """
        Divide el texto en oraciones reales y devuelve aquellas que contienen
        palabras emocionales. Si no hay puntuación, divide por comas o conjunciones.
        """
        # Dividir por puntuación estándar o saltos de línea
        oraciones = re.split(r'[.!?;]|\n', texto)
        
        # Si las oraciones resultantes son muy largas, subdividir por comas o " y "
        sub_oraciones = []
        for o in oraciones:
            if len(o) > 80:
                sub_oraciones.extend(re.split(r'[,]| y ', o))
            else:
                sub_oraciones.append(o)

        frases_con_emocion = []
        for o in sub_oraciones:
            o_clean = o.strip()
            # Filtro de longitud razonable
            if 10 < len(o_clean) < 150:
                if self._contiene_emocion(o_clean):
                    frases_con_emocion.append(o_clean)
            elif len(o_clean) >= 150:
                if self._contiene_emocion(o_clean):
                    frases_con_emocion.append(o_clean[:147] + "...")

        contador = Counter(frases_con_emocion)
        return dict(contador.most_common(top_n))

    def _contiene_emocion(self, frase: str) -> bool:
        """Verifica si la frase contiene alguna palabra de los patrones emocionales."""
        for categoria in [DEPRESION_COMP, ANSIEDAD_COMP, ESTRES_COMP]:
            for _, (regex, _) in categoria.items():
                if regex.search(frase):
                    return True
        return False

    # ------------------------------------------------------------------------
    # Análisis principal (scores, síntomas, alerta)
    # ------------------------------------------------------------------------
    def analizar_entrada(self, texto: str) -> Dict:
        texto_limpio = self._limpiar_texto(texto)
        tokens = texto_limpio.split()
        scores = {
            "depresion": self._calcular_score(texto_limpio, tokens, DEPRESION_COMP),
            "ansiedad": self._calcular_score(texto_limpio, tokens, ANSIEDAD_COMP),
            "estres": self._calcular_score(texto_limpio, tokens, ESTRES_COMP),
        }
        sintomas = self._extraer_sintomas(texto_limpio, tokens)
        alerta = any(score >= self.umbral_alerta for score in scores.values())
        return {
            "scores": scores,
            "sintomas_detectados": sintomas,
            "alerta": alerta,
            "texto_original": texto[:200] + "..." if len(texto) > 200 else texto
        }

    def _calcular_score(self, texto: str, tokens: List[str], patrones_comp) -> float:
        total_peso = 0.0
        max_posible = sum(peso for _, (_, peso) in patrones_comp.items())
        if max_posible == 0:
            return 0.0

        for sintoma, (regex, peso_base) in patrones_comp.items():
            for match in regex.finditer(texto):
                inicio_match = match.start()
                contexto = self._obtener_contexto(texto, inicio_match)
                factor_neg = 0.0 if self._hay_negacion(contexto) else 1.0
                factor_int = 1.5 if self._hay_intensificador(contexto) else 1.0
                total_peso += peso_base * factor_neg * factor_int

        score = min(total_peso / max_posible, 1.0)
        return round(score, 3)

    def _obtener_contexto(self, texto: str, pos: int) -> str:
        inicio = max(0, pos - 100)
        return texto[inicio:pos]

    def _hay_negacion(self, contexto: str) -> bool:
        palabras = set(re.findall(r'\b\w+\b', contexto.lower()))
        return bool(palabras & NEGACIONES)

    def _hay_intensificador(self, contexto: str) -> bool:
        palabras = set(re.findall(r'\b\w+\b', contexto.lower()))
        return bool(palabras & INTENSIFICADORES)

    def _extraer_sintomas(self, texto: str, tokens: List[str]) -> List[str]:
        sintomas = []
        for categoria, patrones_comp in [("depresion", DEPRESION_COMP),
                                         ("ansiedad", ANSIEDAD_COMP),
                                         ("estres", ESTRES_COMP)]:
            for sintoma, (regex, _) in patrones_comp.items():
                for match in regex.finditer(texto):
                    contexto = self._obtener_contexto(texto, match.start())
                    if not self._hay_negacion(contexto):
                        sintomas.append(f"{categoria}:{sintoma}")
        return list(set(sintomas))

    def _limpiar_texto(self, texto: str) -> str:
        limpio = re.sub(r'[^\wáéíóúüñ\s]', ' ', texto.lower())
        limpio = re.sub(r'\s+', ' ', limpio)
        return limpio.strip()

    # ------------------------------------------------------------------------
    # Historial y persistencia
    # ------------------------------------------------------------------------
    def guardar_entrada(self, texto: str, fecha: Optional[date] = None):
        if fecha is None:
            fecha = date.today()
        resultado = self.analizar_entrada(texto)
        registro = {
            "fecha": fecha.isoformat(),
            "scores": resultado["scores"],
            "alerta": resultado["alerta"],
            "sintomas": resultado["sintomas_detectados"][:10],
            "texto_resumen": resultado["texto_original"]
        }
        self.historial.append(registro)
        if self.historial_path:
            self._guardar_historial()
        return registro

    def obtener_tendencia(self, ultimos_dias: int = 7) -> Dict:
        if len(self.historial) < 2:
            return {k: "insuficiente" for k in ["depresion", "ansiedad", "estres"]}
        ordenados = sorted(self.historial, key=lambda x: x["fecha"])
        recientes = ordenados[-ultimos_dias:]
        if len(recientes) < 2:
            return {k: "estable" for k in ["depresion", "ansiedad", "estres"]}
        tendencias = {}
        for categoria in ["depresion", "ansiedad", "estres"]:
            valores = [r["scores"][categoria] for r in recientes]
            n = len(valores)
            if n <= 3:
                delta = valores[-1] - valores[0]
            else:
                primero = sum(valores[:n//3]) / (n//3)
                ultimo = sum(valores[-n//3:]) / (n//3)
                delta = ultimo - primero
            if delta > 0.1:
                tendencias[categoria] = "subiendo"
            elif delta < -0.1:
                tendencias[categoria] = "bajando"
            else:
                tendencias[categoria] = "estable"
        return tendencias

    def _cargar_historial(self):
        try:
            with open(self.historial_path, 'r', encoding='utf-8') as f:
                self.historial = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.historial = []

    def _guardar_historial(self):
        with open(self.historial_path, 'w', encoding='utf-8') as f:
            json.dump(self.historial, f, indent=2, ensure_ascii=False)


# ============================================================================
# 4. Singleton para compatibilidad con la antigua API
# ============================================================================
_analyzer_instance = None

def get_regex_emotion_analyzer(historial_path: Optional[str] = None):
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = DiaryAnalyzer(historial_path=historial_path)
    return _analyzer_instance


# ============================================================================
# 5. Ejemplo de uso
# ============================================================================
if __name__ == "__main__":
    analizador = DiaryAnalyzer(historial_path="diario_historial.json")

    texto_ejemplo = """
    Hoy estoy muy nervioso porque tengo una reunión importante. 
    No puedo dejar de pensar en lo que saldrá mal. 
    Me siento frustrado y cansado, no duermo bien.
    Estoy nervioso y con taquicardia.
    """

    print("=== CONCEPTOS CLAVE ===")
    conceptos = analizador.get_key_concepts(texto_ejemplo, top_n=5)
    for concepto in conceptos:
        print(f"  • {concepto}")

    print("\n=== PATRONES RECURRENTES (bigramas/trigramas) ===")
    tokens = analizador.clean_and_tokenize(texto_ejemplo)
    patrones = analizador.extract_bigrams(tokens, top_n=8)
    for patron, freq in patrones.items():
        print(f"  • {patron.upper()} ({freq})")

    print("\n=== FRASES RELEVANTES (oraciones completas) ===")
    frases = analizador.extraer_frases_relevantes(texto_ejemplo, top_n=3)
    for frase, freq in frases.items():
        print(f"  • {frase} ({freq})")