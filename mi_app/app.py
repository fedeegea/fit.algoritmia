from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Definir los grupos musculares y los ejercicios correspondientes
grupos_musculares = ["Pecho", "Espalda", "Brazo", "Piernas"]
ejercicios = [
    ["Press de banca", "Flexiones", "Pull-over"],          # Pecho
    ["Dominadas", "Remo con barra", "Peso muerto"],       # Espalda
    ["Flexiones de bíceps", "Press de tríceps", "Curl de martillo"], # Brazo
    ["Sentadillas", "Prensa de piernas", "Zancadas"]      # Piernas
]

# Rangos para la generación aleatoria de series y repeticiones
min_series = 3
max_series = 5
min_repeticiones = 8
max_repeticiones = 12

def generar_rutina(dificultad):
    cantidad_por_grupo = 0  # Valor predeterminado
    
    # Ajustar la cantidad de ejercicios según la dificultad
    if dificultad == "principiante":
        cantidad_por_grupo = 1
    elif dificultad == "intermedio":
        cantidad_por_grupo = 2
    elif dificultad == "avanzado":
        cantidad_por_grupo = 3
    
    # Inicializar la rutina
    rutina = []
    ejercicios_seleccionados = []  # Lista para evitar repeticiones
    
    # Seleccionar ejercicios aleatoriamente sin repetir
    for _ in range(cantidad_por_grupo):
        for i, grupo_muscular in enumerate(grupos_musculares):
            ejercicio = random.choice(ejercicios[i])
            while ejercicio in ejercicios_seleccionados:
                ejercicio = random.choice(ejercicios[i])
            rutina.append((ejercicio, random.randint(min_series, max_series), random.randint(min_repeticiones, max_repeticiones)))
            ejercicios_seleccionados.append(ejercicio)
    
    return rutina

def calcular_porcentaje_grupo_muscular(rutina):
    total_ejercicios = len(rutina)
    ejercicios_por_grupo = [0] * len(grupos_musculares)

    # Contar la cantidad de ejercicios por grupo muscular
    for ejercicio, _, _ in rutina:
        for i, grupo in enumerate(grupos_musculares):
            if ejercicio in ejercicios[i]:
                ejercicios_por_grupo[i] += 1
    
    # Calcular el porcentaje para cada grupo muscular
    porcentajes = []
    for i, cantidad in enumerate(ejercicios_por_grupo):
        porcentaje = (cantidad / total_ejercicios) * 100
        porcentajes.append({"grupo": grupos_musculares[i], "porcentaje": porcentaje})

    return porcentajes

def grupo_con_mas_series(rutina):
    series_por_grupo = [0] * len(grupos_musculares)

    # Calcular la cantidad total de series por grupo muscular
    for ejercicio, series, _ in rutina:
        for i, grupo in enumerate(grupos_musculares):
            if ejercicio in ejercicios[i]:
                series_por_grupo[i] += series
    
    # Encontrar el grupo muscular con la mayor cantidad de series
    max_series = max(series_por_grupo)
    grupo_max_series = grupos_musculares[series_por_grupo.index(max_series)]

    return grupo_max_series, max_series

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generar_rutina', methods=['POST'])
def generar():
    data = request.get_json()
    dificultad = data['dificultad']
    rutina = generar_rutina(dificultad)
    return jsonify(rutina)

@app.route('/calcular_estadisticas', methods=['POST'])
def calcular_estadisticas():
    data = request.get_json()
    rutina = data['rutina']
    porcentajes = calcular_porcentaje_grupo_muscular(rutina)
    grupo_max_series, max_series = grupo_con_mas_series(rutina)
    return jsonify({
        'porcentajes': porcentajes,
        'grupo_max_series': grupo_max_series,
        'max_series': max_series
    })

if __name__ == '__main__':
    app.run(debug=True)
