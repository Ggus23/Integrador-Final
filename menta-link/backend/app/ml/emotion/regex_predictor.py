import json
import re
from collections import Counter
from datetime import date
from typing import Dict, List, Optional

# ============================================================================
# 1. Definición de patrones para depresión, ansiedad y estrés
# ============================================================================

DEPRESION_PATRONES = {
    "tristeza": (
        r"\b(triste|deprimid[oa]|melancólic[oa]|melancolí[oa]|desanimad[oa]|baj[oa] de ánimo|desganad[oa]|sin ganas)\b",
        1.0,
    ),
    "desesperanza": (
        r"\b(desesperanz[oa]|sin esperanza|sin sentido|nada vale la pena|no hay salida|nada tiene sentido|ya no quiero vivir|no quiero seguir (viviendo|así))\b",
        1.2,
    ),
    "fatiga": (
        r"\b(cansanci[oa]|cansad[oa]|agotamient[oa]|sin energía|fatigad[oa]|sin fuerzas)\b",
        0.8,
    ),
    "inutilidad": (r"\b(inútil|fracasad[oa]|no valgo|no sirvo|incompetente)\b", 1.1),
    "cambios_sueno": (
        r"\b(insomnio|duermo mucho|hipersomnia|despertar temprano|problemas de sueño|malos hábitos de sueño)\b",
        0.9,
    ),
    "pensamientos_negativos": (
        r"\b(culpa|autocrític[oa]|odio a mí mismo|no merezco)\b",
        1.0,
    ),
}

ANSIEDAD_PATRONES = {
    "nerviosismo": (
        r"\b(nervios[oa]|inquiet[oa]|tens[oa]|intranquil[oa]|agitad[oa]|ansios[oa]|ansiedad)\b",
        1.0,
    ),
    "preocupacion": (
        r"\b(preocupad[oa]|angustiad[oa]|rumiando|pensando demasiado|anticipando lo peor)\b",
        1.1,
    ),
    "miedo": (r"\b(miedo|temor|pánico|aterrorizad[oa]|fobia)\b", 1.2),
    "sintomas_fisicos": (
        r"\b(corazón acelerado|palpitaciones|sudor|temblor|falta de aire|opresión en el pecho|taquicardia)\b",
        1.0,
    ),
    "evitacion": (r"\b(evito|escapo|no salgo|no quiero enfrentar)\b", 0.8),
    "hipervigilancia": (
        r"\b(alerta constante|sobresalt[oa]|asustadizo|vigilando todo)\b",
        0.9,
    ),
}

ESTRES_PATRONES = {
    "sobrecarga": (
        r"\b(sobrecargad[oa]|abrumad[oa]|colmad[oa]|no puedo más|demasiadas cosas|estrés|estres|estresad[oa]s?|estres[oa])\b",
        1.2,
    ),
    "presion": (r"\b(presión|exigencia|plazos|obligaciones|debo hacer todo)\b", 1.0),
    "irritabilidad": (
        r"\b(irritable|enfadad[oa]|frustrad[oa]|pierdo la paciencia|me enojo fácil)\b",
        1.0,
    ),
    "agotamiento": (
        r"\b(agotamient[oa]|quemad[oa]|burnout|sin motivación|desgaste)\b",
        1.1,
    ),
    "problemas_concentracion": (
        r"\b(desconcentrad[oa]|olvidadizo|bloqueo mental|no puedo enfocarme)\b",
        0.9,
    ),
    "cambios_apetito": (
        r"\b(como mucho|sin apetito|atracones|pierdo el hambre|no estoy comiendo|hábitos de alimentación)\b",
        0.8,
    ),
}

# Patrones de emociones positivas para que el análisis no solo detecte lo negativo.
# Permite que el "Análisis Emocional AI" clasifique entradas felices/motivadas
# (antes todo texto sin palabras negativas caía en Neutral y las visualizaciones
# quedaban vacías).
POSITIVO_PATRONES = {
    "felicidad": (
        r"\b(feliz|felices|content[oa]|alegre|alegrí[oa]|alegria|sonri[óo])\b",
        1.2,
    ),
    "motivacion": (
        r"\b(motivad[oa]|entusiasmad[oa]|con ganas|optimista|ilusionad[oa]|con energía)\b",
        1.1,
    ),
    "tranquilidad": (
        r"\b(tranquil[oa]|calmad[oa]|relajad[oa]|en paz|sin preocupaciones)\b",
        0.9,
    ),
    "satisfaccion": (
        r"\b(genial|excelente|increíble|increible|maravillos[oa]|satisfech[oa]|me fue bien|todo bien|muy bien|logré|logre|aprobé|aprobe|éxito|exito)\b",
        1.0,
    ),
    "agradecimiento": (
        r"\b(agradecid[oa]|agradecid[oa]s|orgullos[oa]|gracias a dios)\b",
        0.8,
    ),
}

# ============================================================================
# 2. Negaciones e intensificadores
# ============================================================================
NEGACIONES = {"no", "ni", "nunca", "jamás", "sin", "tampoco", "ningún", "ninguna"}
INTENSIFICADORES = {
    "muy",
    "mucho",
    "demasiado",
    "siempre",
    "constantemente",
    "extremadamente",
    "terriblemente",
}

# Stopwords que hacen que una frase sea incompleta si están al final o inicio
STOPWORDS_ANALISIS = {
    "y",
    "e",
    "ni",
    "o",
    "u",
    "de",
    "del",
    "la",
    "las",
    "lo",
    "los",
    "el",
    "que",
    "por",
    "para",
    "con",
    "sin",
    "a",
    "ante",
    "bajo",
    "cabe",
    "contra",
    "desde",
    "durante",
    "en",
    "entre",
    "hacia",
    "hasta",
    "mediante",
    "para",
    "por",
    "según",
    "sin",
    "so",
    "sobre",
    "tras",
    "ya",
    "también",
    "tambien",
    "más",
    "pero",
    "aunque",
    "si",
    "no",
    "me",
    "mi",
    "mis",
    "su",
    "sus",
    "te",
    "ti",
    "nos",
    "os",
    "creo",
    "que",
    "porque",
    "ultimamente",
    "últimamente",
    "así",
    "asi",
    "tan",
    "muy",
    "bastante",
    "un",
    "una",
    "unos",
    "unas",
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
POSITIVO_COMP = compilar_patrones(POSITIVO_PATRONES)


# ============================================================================
# 3. Clase DiaryAnalyzer (mejorada con extracción de frases con sentido)
# ============================================================================
class DiaryAnalyzer:
    def __init__(
        self, historial_path: Optional[str] = None, umbral_alerta: float = 0.6
    ):
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
        sintomas = resultado["sintomas_detectados"]
        max_score_cat = max(scores, key=scores.get)
        max_val = scores[max_score_cat]
        mapeo_emociones = {
            "depresion": "triste",
            "ansiedad": "ansioso",
            "estres": "frustrado",
            "felicidad": "feliz",
        }
        emotion_label = "neutral"
        # Umbral bajo: un solo sintoma emocional claro (peso minimo 0.8 de X
        # categorias) ya cuenta como la emocion, para que las entradas cortas
        # del diario ("estoy triste", "estoy ansioso", "estoy feliz") no se
        # pierdan como neutral.
        if max_val >= 0.12:
            emotion_label = mapeo_emociones.get(max_score_cat, "neutral")
            # Distinguir motivación de felicidad para la clasificación canónica:
            # si la entrada es positiva y hay un síntoma de motivación, reportar
            # "motivado" (usado por ARI y los paneles de tendencias).
            if emotion_label == "feliz" and "positivo:motivacion" in sintomas:
                emotion_label = "motivado"
        return {
            "emotion": emotion_label,
            "scores": scores,
            "sintomas": resultado["sintomas_detectados"],
            "alerta": resultado["alerta"],
        }

    # ------------------------------------------------------------------------
    # NUEVOS MÉTODOS PARA EXTRACCIÓN DE FRASES CON SENTIDO
    # ------------------------------------------------------------------------
    def get_key_concepts(self, text: str, top_n: int = 10) -> List[str]:
        """
        Extrae conceptos clave (frases cortas que contengan palabras emocionales),
        conservando el modificador cuando aporta significado (p.ej. "muy triste",
        "sin esperanza") y eliminando conectores vacíos de los extremos.
        """
        texto_limpio = self._limpiar_texto(text)
        tokens = texto_limpio.split()
        if len(tokens) < 2:
            return []

        # Mapa de posicion de caracter -> indice de token, para localizar el
        # span completo del match (incluso frases multi-palabra como "sin esperanza").
        offset_acumulado = []
        acum = 0
        for tok in tokens:
            offset_acumulado.append(acum)
            acum += len(tok) + 1

        def indice_token(pos_caracter):
            idx = 0
            for off in offset_acumulado:
                if off <= pos_caracter:
                    idx = offset_acumulado.index(off)
                else:
                    break
            return idx

        frases_candidatas = []
        for categoria in [DEPRESION_COMP, ANSIEDAD_COMP, ESTRES_COMP, POSITIVO_COMP]:
            for _, (regex, _) in categoria.items():
                for match in regex.finditer(texto_limpio):
                    tok_ini = indice_token(match.start())
                    tok_fin = indice_token(match.end() - 1)

                    # Ventana = la frase del match + 1 palabra antes y 1 después
                    inicio = max(0, tok_ini - 1)
                    fin = min(len(tokens), tok_fin + 2)
                    ventana_tokens = tokens[inicio:fin]

                    # Limpiar stopwords de los extremos, preservando las que son
                    # parte del propio match (p.ej. "sin" en "sin esperanza",
                    # "no" en "no quiero vivir").
                    # tokens del propio match:
                    match_tokens = tokens[tok_ini : tok_fin + 1]
                    while (
                        ventana_tokens
                        and ventana_tokens[0] in STOPWORDS_ANALISIS
                        and ventana_tokens[0] not in match_tokens[:1]
                    ):
                        ventana_tokens.pop(0)
                    while (
                        ventana_tokens
                        and ventana_tokens[-1] in STOPWORDS_ANALISIS
                        and ventana_tokens[-1] not in match_tokens[-1:]
                    ):
                        ventana_tokens.pop()

                    if ventana_tokens:
                        frases_candidatas.append(" ".join(ventana_tokens))

        contador = Counter(frases_candidatas)
        return [frase for frase, _ in contador.most_common(top_n)]

    def extract_meaningful_phrases(
        self, tokens: List[str], top_n: int = 10
    ) -> Dict[str, int]:
        """
        Genera bigramas y trigramas que contengan al menos una palabra emocional
        y que no terminen en una stopword vacía (como "y", "de", "que").
        Ideal para "PATRONES RECURRENTES".
        """
        if not tokens or len(tokens) < 2:
            return {}

        frases_candidatas = []

        # Bigramas
        for i in range(len(tokens) - 1):
            bigrama = f"{tokens[i]} {tokens[i+1]}"
            if self._contiene_emocion(bigrama):
                if tokens[i + 1] not in STOPWORDS_ANALISIS:
                    frases_candidatas.append(bigrama)

        # Trigramas
        for i in range(len(tokens) - 2):
            trigrama = f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}"
            if self._contiene_emocion(trigrama):
                if tokens[i + 2] not in STOPWORDS_ANALISIS:
                    frases_candidatas.append(trigrama)

        contador = Counter(frases_candidatas)
        return dict(contador.most_common(top_n))

    def extraer_frases_relevantes(self, texto: str, top_n: int = 10) -> Dict[str, int]:
        """
        Divide el texto en oraciones reales y devuelve aquellas que contienen
        palabras emocionales. Si no hay puntuación, divide por comas o conjunciones.
        """
        if not texto:
            return {}
        # Dividir por puntuación estándar o saltos de línea
        oraciones = re.split(r"[.!?;]|\n", texto)

        # Si las oraciones resultantes son muy largas, subdividir por comas o " y "
        sub_oraciones = []
        for o in oraciones:
            if len(o) > 80:
                sub_oraciones.extend(re.split(r"[,]| y ", o))
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
        for categoria in [DEPRESION_COMP, ANSIEDAD_COMP, ESTRES_COMP, POSITIVO_COMP]:
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
            "felicidad": self._calcular_score(texto_limpio, tokens, POSITIVO_COMP),
        }
        sintomas = self._extraer_sintomas(texto_limpio, tokens)
        alerta = any(score >= self.umbral_alerta for score in scores.values())
        texto_original = str(texto) if texto else ""
        return {
            "scores": scores,
            "sintomas_detectados": sintomas,
            "alerta": alerta,
            "texto_original": (
                (texto_original[:200] + "...")
                if len(texto_original) > 200
                else texto_original
            ),
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
        # Tomamos hasta 60 caracteres previos, recortando en el ultimo conector
        # (y, pero, aunque, porque, entonces, sin embargo) para evaluar la
        # negacion dentro de la MISMA clausula y no anular palabras de clausulas
        # anteriores (p.ej. "No fui a clases y estoy triste" -> "estoy triste").
        inicio = max(0, pos - 60)
        contexto = texto[inicio:pos]
        conectores = (
            " pero ",
            " aunque ",
            " porque ",
            " entonces ",
            " sin embargo ",
            " sino ",
            " y no ",
            " y ",
        )
        ultimo_sep = -1
        for con in conectores:
            idx = contexto.rfind(con)
            if idx > ultimo_sep:
                ultimo_sep = idx
        if ultimo_sep != -1:
            contexto = contexto[ultimo_sep + 1 :]
        return contexto

    def _hay_negacion(self, contexto: str) -> bool:
        # Evaluamos la negacion solo sobre las ultimas pocas palabras previas a
        # la palabra emocional, ya que es donde suele residir el "no" que la
        # afecta ("no estoy triste"). Esto evita que un "no" lejano en una
        # clausula anterior anule un sentimiento real ("No fui a clases... estoy
        # triste" -> el "no" ya no anula "triste").
        palabras = re.findall(r"\b\w+\b", contexto.lower()) or [""]
        ultimas = palabras[-4:]
        return bool(set(ultimas) & NEGACIONES)

    def _hay_intensificador(self, contexto: str) -> bool:
        palabras = set(re.findall(r"\b\w+\b", contexto.lower()))
        return bool(palabras & INTENSIFICADORES)

    def _extraer_sintomas(self, texto: str, tokens: List[str]) -> List[str]:
        sintomas = []
        for categoria, patrones_comp in [
            ("depresion", DEPRESION_COMP),
            ("ansiedad", ANSIEDAD_COMP),
            ("estres", ESTRES_COMP),
            ("positivo", POSITIVO_COMP),
        ]:
            for sintoma, (regex, _) in patrones_comp.items():
                for match in regex.finditer(texto):
                    contexto = self._obtener_contexto(texto, match.start())
                    if not self._hay_negacion(contexto):
                        sintomas.append(f"{categoria}:{sintoma}")
        return list(set(sintomas))

    def _limpiar_texto(self, texto: str) -> str:
        if not texto:
            return ""
        limpio = re.sub(r"[^\wáéíóúüñ\s]", " ", texto.lower())
        limpio = re.sub(r"\s+", " ", limpio)
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
            "texto_resumen": resultado["texto_original"],
        }
        self.historial.append(registro)
        if self.historial_path:
            self._guardar_historial()
        return registro

    def obtener_tendencia(self, ultimos_dias: int = 7) -> Dict:
        if len(self.historial) < 2:
            return {
                k: "insuficiente"
                for k in ["depresion", "ansiedad", "estres", "felicidad"]
            }
        ordenados = sorted(self.historial, key=lambda x: x["fecha"])
        recientes = ordenados[-ultimos_dias:]
        if len(recientes) < 2:
            return {
                k: "estable" for k in ["depresion", "ansiedad", "estres", "felicidad"]
            }
        tendencias = {}
        for categoria in ["depresion", "ansiedad", "estres", "felicidad"]:
            valores = [r["scores"][categoria] for r in recientes]
            n = len(valores)
            if n <= 3:
                delta = valores[-1] - valores[0]
            else:
                primero = sum(valores[: n // 3]) / (n // 3)
                ultimo = sum(valores[-n // 3 :]) / (n // 3)
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
            with open(self.historial_path, "r", encoding="utf-8") as f:
                self.historial = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.historial = []

    def _guardar_historial(self):
        with open(self.historial_path, "w", encoding="utf-8") as f:
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
