# Brainstein
## 1. Introducción
Este documento tiene como objetivo principal plasmar el diseño y los elementos que debe incluir el videojuego Brainstein. Este videojuego esta pensado para ser jugado en navegadores web de ordenadores.
### 1.1 Concepto del juego
Brainstein es un juego multijugador cooperativo para dos jugadores en el que ambos jugadores controlan a dos científicos, Erwin y Darwin, y deberán trabajar para defender el cerebro de Einstein de las hordas de zombis que han arrasado la civilización. Para ello, los jugadores dispondrán tanto de un abanico de armas como de sus habilidades de construcción para intentar impedir el paso de los zombis.
### 1.2 Características principales
Las características principales de Brainstein son:
- **Táctica**: detener a las oleadas de enemigos debe ser imposible si no se tiene un plan o una táctica antes. Para ello se usará las habilidades de construcción de nuestros científicos.
- **Dinamismo**: excepto en los pequeños momentos de pausa entre oleadas, el juego tiene pocos momentos de pausa, teniendo un factor de tensión continua.
- **Planteamiento sencillo**: la historia del juego es sencilla y fácil de entender, lo suficiente para que el jugador sienta que tiene un objetivo.
### 1.3	Género
Brainstein supone una unión de varios géneros. A continuación, se exponen los géneros de los que toma elementos:
- **Shooter**: género de videojuegos que tienen la característica común de permitir controlar un personaje que dispone de un arma que puede ser disparada a voluntad.
- **Survival**: género ambientado en un ambiente hostil e intenso donde los jugadores empiezan con equipos mínimos y se les exige que recolecten recursos y sobrevivan el mayor tiempo posible.
### 1.4 Plataforma objetivo
Este videojuego está pensado para ser jugado en navegadores web de ordenadores.
### 1.5 Mecánicas principales
- El objetivo del juego es sobrevivir la mayor cantidad posible de oleadas.
- Habrá varias pantallas donde los jugadores podrán jugar.
- En algún lugar de la pantalla aparecerá el cerebro de Einstein, que podrá ser movido por los jugadores.
- Los jugadores perderán si los zombis destruyen el cerebro de Eisntein o si la vida de ambos llega a 0 en la misma oleada.
- Para defenderse los jugadores podrán usar armas para matar a los zombis y podrán construir paredes y estructuras para retrasar e impedir el paso de los zombis, creando así una especie de fuerte.
### 1.6 Público objetivo
Brainstein está dirigido a un amplio rango de jugadores mientras estos tengan conexión a internet. El tono desenfadado del juego hace que encaje mejor con un abanico de edad más joven.

## 2. Mecánicas de juego 
En esta sección se explicará en detalle las mecánicas de Brainstein, tanto los pilares que fundamentan su jugabilidad como las acciones que puede tomar el jugador.
### 2.1 Objetivo del juego
El objetivo del juego es conseguir sobrevivir la mayor cantidad posible de oleadas. Cada oleada, tanto el número como la dificultad de los enemigos aumentará. Los jugadores deberán evitar que los zombis destruyan el cerebro de Einstein o que la vida de ambos llegue a cero en la misma oleada.
### 2.2 Armas
Para poder hacer frente a los zombis, los jugadores podrán contar con un abanico de armas que usarán para matarlos. Todas las armas tendrán una munición máxima y actual. Cuando la munición actual llegue a 0, el jugador ya no podrá utilizarla. Ambos jugadores empezarán con una pistola. Para conseguir munición o armas, durante las oleadas y de manera aleatoria, caerán paquetes de ayuda en cualquier parte de la pantalla. Cuando un jugador recoge una de estas cajas, consigue munición. Es posible que la caja además contenga una nueva arma. Las armas disponibles en el juego son:
- Pistola: arma básica con la que empiezan ambos jugadores. Es el arma que menos daño hace a los enemigos. Además, solo dispara una bala cada vez, no dispara en área y tiene un alcance medio.
- AK-47: puede disparar muchas balas muy rápido, aunque el daño de cada bala no es muy elevado. Tiene un gran alcance. 
- Escopeta: tiene poco alcance, pero dispara varias balas en un área en forma de cono delante del jugador.
- Granada: explosiona en área al tiempo de ser disparada.
### 2.3 Construcción:
En todo momento durante la partida, ambos jugadores tienen la posibilidad de construir paredes, puertas o redes para forzar a los zombis a seguir cierto camino o dificultar su avance. Construir cuesta recursos, que se consiguen matando a los enemigos. Cada jugador tiene sus propios recursos.

Para construir, el jugador deberá escoger el elemento que quiere construir (así como elegiría un arma) y delante de él aparecerá la silueta del objeto que quiere construir, para que el jugador pueda ver fácilmente la posición en la que se construiría. Si el jugador se mueve antes de finalizar la construcción, la silueta del elemento a construir se moverá con él hasta que confirme la construcción. Mientras se tenga elegida una construcción, el jugador no podrá disparar. Una vez finalizada la construcción, ésta no se podrá mover.
Cada construcción tiene una vida definida. Si un zombi ve que su camino ha sido bloqueado, puede elegir buscar otro camino o atacar a la estructura que le bloquea el paso. Cuando la vida de una estructura llega a 0, ésta es destruida. Los jugadores pueden disparar a través de las construcciones.
Las construcciones disponibles en Brainstein son: 
- Barricada: tiene una vida elevada, pero los jugadores no pueden atravesarla.
- Puerta: tiene menos vida que una barricada, pero los jugadores pueden abrirla y cerrarla para poder moverse a través de ella.
- Red: no impide el paso de los zombis, si no que los ralentiza. Pierde vida a medida que pasa el tiempo.
### 2.4 Zombis
Los zombis son el enemigo principal del juego, ya que quieren comerse el valioso cerebro de Einstein. Hay varios tipos de zombi en el juego, cada uno con una vida o habilidades distintas. Cuando la vida de un zombi llega a cero, este zombi muere y otorga al jugador que le ha derrotado una cantidad de dinero definida por el tipo de zombi. Todos los zombis atacan cuerpo a cuerpo salvo una excepción.
- Normie: el zombi más común. Tiene una vida media y simplemente se mueve hacia el jugador. Si encuentra si camino obstaculizado, tiene más probabilidades de buscar otro camino que de atacar una estructura.
- Tankie: es un zombi con una gran cantidad de vida. Si ve su camino obstaculizado, los más probable es que ataque a las estructuras, infligiendo un daño elevado.
- Zombi a propulsión: tiene una vida media, pero cuando se encuentra una estructura bloqueando el camino, en vez de atacarla, la saltará.
- Escupidor: tiene una vida media y tiene la habilidad de atacar a distancia.
### 2.5 El cerebro de Einstein 
El preciado cerebro de Einstein es lo que ambos jugadores deben defender con sus vidas. Tiene una cantidad de vida predefinida, y si esta llega a cero los jugadores pierden. Si los jugadores consideran que el cerebro está en una zona peligrosa o poco ventajosa, tienen la opción de moverlo. Para ello, uno de los jugadores tendrá que cogerlo para llevarlo a otro lugar. Mientras lo tenga cogido, se moverá más lento, no podrá disparar ni podrá abrir o cerrar puertas. Siempre tiene la opción de dejarlo en un punto arbitrario del camino para recogerlo más tarde.

Si ambos jugadores están muertos a la vez, pierden. Sin embargo, puede darse la situación en la que solo uno de los jugadores este muerto. En este caso, el jugador que está vivo puede ir hasta la posición del jugador derrotado para intentar resucitarle. Resucitar lleva tiempo y no se podrá disparar mientras se realiza. Si el proceso se interrumpe se deberá reiniciar desde cero. No hay limite de tiempo para hacerlo, siempre y cuando el otro jugador este vivo. 

### 2.6 Cámara y controles
La cámara será completamente cenital, teniendo visión en todo momento de la totalidad de la pantalla. Para jugar se necesitará ratón y teclado. El teclado se utilizará para el movimiento y para cambiar de arma y de construcción mientras que el ratón se utilizará para apuntar, disparar y construir.

## 3. El flujo de juego
A lo largo de esta sección se detallará el transcurso de una partida típica de
Brainstein. Se comentarán los pasos que ha de seguir el Jugador desde el
Inicio de una partida hasta finalizarla. Poco a poco vamos desgranando el funcionamiento exacto del juego. 

Los jugadores comienzan la partida y tienen unos segundos antes de que empiece la primera oleada. En este tiempo deberán analizar la pantalla, ver posible puntos fuertes y débiles, y mover el cerebro de Einstein si lo viesen necesario, aunque lo normal sería que no les diese tiempo antes de que la oleada comenzase.

Comienza la primera oleada, la más sencilla de todas, y comienza la acción. Los jugadores deberán cooperar y llegar a una estrategia de construcción mientras compiten por llevarse la mayor cantidad de oro. Una vez finalizada la primera oleada, tienen un poco de tiempo para relajarse, ver posibles fallos en su estrategia o en su estructura, antes de volver a ponerse a cubierto porque llega la siguiente oleada de zombis. Las oleadas son cada vez más y más complicadas hasta que los jugadores al final caen derrotados. En ese punto, se guarda la marca que han conseguido o se compara con otras posibles marcas que hayan podido conseguir.

Al acabar tendrán la opción de empezar otra partida o salir del juego.

## 4.Interfaz
