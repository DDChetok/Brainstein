# Brainstein
Un juego desarrollado por *Numbah004*.
## 1. Introducción
Este documento tiene como objetivo principal plasmar el diseño y los elementos que debe incluir el videojuego *Brainstein*. Este videojuego esta pensado para ser jugado en navegadores web de ordenadores.
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/brainstein%203.png)
*Portada del juego*

### 1.1 Concepto del juego
*Brainstein* es un juego multijugador cooperativo para dos jugadores en el que ambos jugadores controlan a dos científicos, Erwin y Darwin, y deberán trabajar para defender el cerebro de Einstein de las hordas de zombis que han arrasado la civilización. Para ello, los jugadores dispondrán tanto de un abanico de armas como de sus habilidades de construcción para intentar impedir el paso de los zombis.

### 1.2 Características principales
Las características principales de *Brainstein* son:
- **Táctica**: detener a las oleadas de enemigos debe ser imposible si no se tiene un plan o una táctica antes. Para ello se usará las habilidades de construcción de nuestros científicos.
- **Dinamismo**: excepto en los pequeños momentos de pausa entre oleadas, el juego tiene pocos momentos de pausa, teniendo un factor de tensión continua.
- **Planteamiento sencillo**: la historia del juego es sencilla y fácil de entender, lo suficiente para que el jugador sienta que tiene un objetivo.

### 1.3	Género
*Brainstein* supone una unión de varios géneros. A continuación, se exponen los géneros de los que toma elementos:
- **Shooter**: género de videojuegos que tienen la característica común de permitir controlar un personaje que dispone de un arma que puede ser disparada a voluntad.
- **Survival**: género ambientado en un ambiente hostil e intenso donde los jugadores empiezan con equipos mínimos y se les exige que recolecten recursos y sobrevivan el mayor tiempo posible.
### 1.4 Plataforma objetivo
Este videojuego está pensado para ser jugado en navegadores web de ordenadores.

### 1.5 Mecánicas principales
- El objetivo del juego es sobrevivir la mayor cantidad posible de oleadas.
- Habrá varias pantallas donde los jugadores podrán jugar.
- En algún lugar de la pantalla aparecerá el cerebro de Einstein, que podrá ser movido por los jugadores.
- Los jugadores perderán si los zombis destruyen el cerebro de Eisntein o si la vida de ambos llega a 0 en la misma oleada.
- Para defenderse los jugadores podrán usar armas para matar a los zombis.

### 1.6 Público objetivo
*Brainstein* está dirigido a un amplio rango de jugadores mientras estos tengan conexión a internet. El tono desenfadado del juego hace que encaje mejor con un abanico de edad más joven.

## 2. Mecánicas de juego 
En esta sección se explicará en detalle las mecánicas de *Brainstein*, tanto los pilares que fundamentan su jugabilidad como las acciones que puede tomar el jugador.

### 2.1 Objetivo del juego
El objetivo del juego es conseguir sobrevivir la mayor cantidad posible de oleadas. Cada oleada, tanto el número como la dificultad de los enemigos aumentará. Los jugadores deberán evitar que los zombis destruyan el cerebro de Einstein o que la vida de ambos llegue a cero en la misma oleada.

### 2.2 Armas
Para poder hacer frente a los zombis, los jugadores podrán contar con un abanico de armas que usarán para matarlos. Todas las armas tendrán una munición máxima y actual. Cuando la munición actual llegue a 0, el jugador ya no podrá utilizarla. Ambos jugadores empezarán con una pistola. Para conseguir munición o armas, durante las oleadas y de manera aleatoria, caerán paquetes de ayuda en cualquier parte de la pantalla. Cuando un jugador recoge una de estas cajas, consigue munición. Es posible que la caja además contenga una nueva arma. Las armas disponibles en el juego son:
- Pistola: arma básica con la que empiezan ambos jugadores. Es el arma que menos daño hace a los enemigos. Además, solo dispara una bala cada vez, no dispara en área y tiene un alcance medio.
- Rifle de Asalto: puede disparar muchas balas muy rápido, aunque el daño de cada bala no es muy elevado. Tiene un gran alcance. 
- Escopeta: tiene poco alcance, pero dispara varias balas en un área en forma de cono delante del jugador.

### 2.3 Construcción:
Esta mecánica al final ha sido eliminada del juego.

### 2.4 Zombis
Los zombis son el enemigo principal del juego, ya que quieren comerse el valioso cerebro de Einstein. Cuando la vida de un zombi llega a cero, este zombi muere, dejando una mancha de sangre en el escenario. Los zombis atacan cuerpo a cuerpo. Los zombis aparecerán en el mapa a través de spawnpoints que habrá situados por el mapa, y aparecerá en uno de ellos de manera aleatoria.
El zombie tiene una vida media y simplemente se mueve hacia el jugador. Si encuentra su camino obstaculizado, tiene más probabilidades de buscar otro camino que de atacar una estructura. El camino que escogerá se decidirá mediante un algoritmo de "Pathfinding", el A*, hasta que lleguen a golpear a los jugadores o al cerebro.

**Inteligencia artificial**
Para la inteligencia artificial de los zombis se utilizará el algoritmo A*, en el que el zombi perseguirá a su objetivo más cercano, ya sea un jugador o el cerebro. 
Para facilitar la implementación del algoritmo A*, se utilizará la librería [EasyStar](https://www.easystarjs.com/).

### 2.5 El cerebro de Einstein 
El preciado cerebro de Einstein es lo que ambos jugadores deben defender con sus vidas. Tiene una cantidad de vida predefinida, y si esta llega a cero los jugadores pierden. Si los jugadores consideran que el cerebro está en una zona peligrosa o poco ventajosa, tienen la opción de moverlo. Para ello, uno de los jugadores tendrá que cogerlo para llevarlo a otro lugar. Mientras lo tenga cogido, se moverá más lento, no podrá disparar ni podrá abrir o cerrar puertas. Siempre tiene la opción de dejarlo en un punto arbitrario del camino para recogerlo más tarde.

Si ambos jugadores están muertos a la vez, pierden. Sin embargo, puede darse la situación en la que solo uno de los jugadores este muerto. En este caso, el jugador que está vivo puede ir hasta la posición del jugador derrotado para intentar resucitarle. Resucitar lleva tiempo y no se podrá disparar mientras se realiza. Si el proceso se interrumpe se deberá reiniciar desde cero. No hay limite de tiempo para hacerlo, siempre y cuando el otro jugador este vivo. 

### 2.6 Cámara y controles
La cámara será completamente cenital, teniendo visión en todo momento de la totalidad de la pantalla. Para jugar se necesitará ratón y teclado. El teclado se utilizará para el movimiento y para cambiar de arma y de construcción mientras que el ratón se utilizará para apuntar, disparar y construir.

## 3. El flujo de juego
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/ingame%20demo.png)
*Demo de como se vería el juego in-game*
A lo largo de esta sección se detallará el transcurso de una partida típica de
*Brainstein*. Se comentarán los pasos que ha de seguir el Jugador desde el
inicio de una partida hasta finalizarla. Poco a poco vamos desgranando el funcionamiento exacto del juego. 

Los jugadores comienzan la partida y tienen unos segundos antes de que empiece la primera oleada. En este tiempo deberán analizar la pantalla, ver posible puntos fuertes y débiles, y mover el cerebro de Einstein si lo viesen necesario, aunque lo normal sería que no les diese tiempo antes de que la oleada comenzase.

Comienza la primera oleada, la más sencilla de todas, y comienza la acción.  Una vez finalizada la primera oleada, tienen un poco de tiempo para relajarse, ver posibles fallos en su estrategia, antes de volver a ponerse a cubierto porque llega la siguiente oleada de zombis. Las oleadas son cada vez más y más complicadas hasta que los jugadores al final caen derrotados.
Al acabar tendrán la opción de empezar otra partida o salir del juego.

## 4.Interfaz
En esta sección se explicará con detalle cada una de las pantallas que componen *Brainstein*. Además, se indicarán las transiciones entre ellas así como la utilidad de cada elemento de la GUI (*Graphical USer Interface*).
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/flujo%20de%20pantallas.png)
*Diagrama de flujo de las pantallas*

### 4.1 Menú Principal
Lista y descripción de todos los componentes del *Menú principal*:
- Botón jugar: Al pulsarlo cambian las opciones del menú, apareciendo "partida pública" y "partida privada" .Si pulsamos partida pública nos lleva a la pantalla de *Asiganción de personajes*. Si pulsamos partida privada el menú vuelve a cambiar para mostrar la posibilidad de crear una partida privada o de unirse a una ya creada. El botón para crear una partida privada lleva a la pantalla de "Asignación de personajes" mientras que el botón para unirse hace cambiar de nuevo el menú para mostrar el luegar donde introducir la clave de esa partida. Si la contraseña introducida es correcta, el jugador pasa a la pantalla de "Asignación de personaje" donde le está esperando su compañero. Cada vez que cambia el menú,este incluye un botó de "volver" para regresar al anterior menú. 
- Botón opciones: al pulsarlo lleva a la pantalla *Opciones*.
- Botón salir: al pulsarlo lleva de vuelta al Sistema Operativo. 
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/Menu%20principal.jpeg)
*Menú principal del juego*
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/Menu%20publica%20privada.jpeg)
*Cambios en el menú*
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/Menu%20crear%20unirse.jpeg)
*Cambios en el menú*
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/Menu%20clave.jpeg)
*Cambios en el menú*

### 4.2 Asignación de personajes
En esta pantalla será cuando se busque a otro jugador para poder comenzar la partida. Una vez encontrado, los jugadores decidirán quien será Erwin y quien será Darwin. Una vez seleccionado, el juego les llevará automáticamente a la pantalla de *Selección de mapa*.

### 4.3 Selección de mapa
En esta pantalla los jugadores podrán elegir el mapa en la que querrán jugar, así como opciones especiales que quieran aplicar a su partida (handicap, más probabilidad de objetos, menos, etc...)
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/Mapa%201.jpeg)
*Prototipo mapa 1*
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/Mapa%202.jpeg)
*Prototipo mapa 2*
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/Mapa%203.jpeg)
*Prototipo mapa 3*

### 4.4 Partida
Aquí los jugadores podrán jugar a la vez que pueden consultar de un vistazo información relevante para la partida:
- Vida de su personaje
- Número de oleada actual
- Tipo de arma seleccionada
- Munición actual
- Munición máxima

Al ser derrotados, aparecerá un texto en mitad de la pantalla para informar a los jugadores de que han perdido.
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/banner%20derrota%201.png)
*Versión 1 del texto de derrota*
![alt text](https://github.com/DDChetok/Brainstein/blob/master/Brainstein/assets/readmeAssets/banner%20derrota%202.png)
*Versión 2 del texto de derrota*

### 4.5 Opciones
En todo momento se podrá acceder a la pantalla de opciones, desde la que se podrá:
- Quitar el sonido y música del juego.
- Reiniciar una partida.
- Salir al menú principal.

## 5. Arte
*Brainstein* debe tener un carácter desenfadado, con un estilo más bien caricaturésco, recalcando el absurdo de la situación. La música y los sonidos también deberán ir acorde con este tono. Crearemos recursos propios como sprites de zombis o personajes pero también utilizaremos assets de Kenney.

## 6. Matchmaking
El emparejamiento entre jugadores se hará teniendo en cuenta el mayor récord de rondas que hayan hecho. Si un jugador ha llegado como mucho a 10 rondas, se buscarán jugadores que hayan llegado a sobrevivir entre 8 y 12 rondas. Si un jugador es la primera vez que juega y por lo tanto su máxima puntuación no está registrada, se le asignará como compañero otro nuevo jugador. Si en cualquier caso no se encontrase otro jugador con una puntuación similar al usuario, el emparejamiento se realizaría teniendo en cuenta la distancia física entre ambos, es decir, se asignará como compañero el jugador que esté más cerca del usuario (y con puntuación mas parecida) para evitar en la medida de lo posible problemas de conexión. Además se dispondrá de la opción de partida privada en el menú principal. Un jugador puede crear una partida privada con una contraseña (generada aleatoriamente por el sistema) y otro puede unirse a ella mediante la contraseña. Si un jugador crea una partida, esperará en la pantalla de asignación de personajes hasta que su compañero se una. Dentro de la partida se dispondrá de un chat para que los jugadores puedan comunicarse y plantear estrategias.

## 7. Posibles ampliaciones
Aunque las mecánicas del juego son bastantes simples, el juego puede ser expandido si se ve que sobra tiempo o recursos. Posibles ampliaciones que se podrían efectuar son, por ejemplo:
- Nuevos tipos de arma, con distinto tipos de efecto y munición.
- Nuevos tipos de zombis, que ataquen o tengan una distinción característica, como, por ejemplo, que exploten.
- Nuevos personajes, un nuevo compañero de Erwin y Darwin, como por ejemplo el gato de Erwin.
- Nuevos escenarios.
Como se ha dicho más arriba, estas expansiones solo se plantearían, diseñarían o dessarollarían si se diese el caso de que sobrase tiempo o de que se extiendese la fecha límite habiendo acabado la base del juego.

## 8. Equipo desarrollador
### Numbah004
Pablo Martínez Domingo Correo:p.martinezd.2016@alumnos.urjc.es
Daniel Dávila Pérez Correo:d.davila.2016@alumnos.urjc.es
Pablo Velilla Álvarez Correo:p.velilla.2016@alumnos.urjc.es
