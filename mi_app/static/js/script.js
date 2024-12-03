document.addEventListener('DOMContentLoaded', () => {
    // Agregar eventos para las animaciones al pasar el ratón
    const titulo = document.getElementById('titulo');
    const logo = document.getElementById('logo');

    titulo.addEventListener('mouseover', () => {
        titulo.classList.add('animate__animated', 'animate__pulse');
    });

    titulo.addEventListener('animationend', () => {
        titulo.classList.remove('animate__animated', 'animate__pulse');
    });

    logo.addEventListener('mouseover', () => {
        logo.classList.add('animate__animated', 'animate__tada');
    });

    logo.addEventListener('animationend', () => {
        logo.classList.remove('animate__animated', 'animate__tada');
    });

    // Manejar la generación de rutina
    document.querySelectorAll('button[data-dificultad]').forEach(button => {
        button.addEventListener('click', () => {
            const dificultad = button.getAttribute('data-dificultad');
            generarRutina(dificultad);
            cambiarColorBoton(button);
        });
    });

    // Manejar la eliminación de ejercicio
    document.getElementById('ejercicio-id').addEventListener('input', () => {
        const id = document.getElementById('ejercicio-id').value;
        const eliminarBtn = document.getElementById('eliminar-btn');
        if (id && id > 0 && id <= rutina.length) {
            eliminarBtn.classList.remove('disabled');
        } else {
            eliminarBtn.classList.add('disabled');
        }
    });
    
    document.getElementById('eliminar-btn').addEventListener('click', (event) => {
        eliminarEjercicio();
        cambiarColorBoton(event.target);
    });
});

let rutina = [];

// Función para generar la rutina
function generarRutina(dificultad) {
    fetch('/generar_rutina', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dificultad: dificultad })
    })
    .then(response => response.json())
    .then(data => {
        rutina = data;
        actualizarLista();
        mostrarEstadisticas();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo generar la rutina. Por favor, inténtalo de nuevo.');
    });
}

// Función para eliminar un ejercicio
function eliminarEjercicio() {
    const id = document.getElementById('ejercicio-id').value;
    if (id && id > 0 && id <= rutina.length) {
        rutina.splice(id - 1, 1);
        actualizarLista();
        mostrarEstadisticas();
    } else {
        alert('Número de ejercicio inválido');
    }
}

// Función para actualizar la lista de ejercicios en la interfaz
function actualizarLista() {
    const rutinaList = document.getElementById('rutina-list');
    rutinaList.innerHTML = '';
    rutina.forEach((ejercicio, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item animate__animated animate__fadeIn';
        li.innerText = `${index + 1}. ${ejercicio[0]}: ${ejercicio[1]} series de ${ejercicio[2]} repeticiones`;
        rutinaList.appendChild(li);
    });
}

// Función para mostrar estadísticas
function mostrarEstadisticas() {
    fetch('/calcular_estadisticas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rutina: rutina })
    })
    .then(response => response.json())
    .then(data => {
        const statsDiv = document.getElementById('stats');
        let statsHTML = '<h3>Estadísticas:</h3>';
        data.porcentajes.forEach(item => {
            statsHTML += `<p>Porcentaje de ejercicios de ${item.grupo}: ${item.porcentaje.toFixed(2)}%</p>`;
        });
        statsHTML += `<p>Grupo muscular con la mayor cantidad de series: ${data.grupo_max_series} con ${data.max_series} series.</p>`;
        statsDiv.innerHTML = statsHTML;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudieron calcular las estadísticas. Por favor, inténtalo de nuevo.');
    });
}

// Función para cambiar el color del botón presionado
function cambiarColorBoton(botonPresionado) {
    // Primero restaurar todos los botones a su estado normal
    document.querySelectorAll('.btn').forEach(btn => {
        btn.style.backgroundColor = '#48C5F4';
        btn.style.color = '#fff';
        btn.style.borderColor = '#48C5F4';
    });
    
    // Luego cambiar el estado del botón presionado
    botonPresionado.style.backgroundColor = '#fff';
    botonPresionado.style.color = '#48C5F4';
    botonPresionado.style.borderColor = '#fff';
}
