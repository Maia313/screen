const img = document.getElementById('img-rescale');

function move() {
	img.classList.add('img-move');
}

function removeOverlay() {
  img.classList.add('img-moved');
  img.src = 'red-youTube_logo.png';
  document.getElementById('intro-overlay').style.background = 'transparent';
}

function scaleOutLogo() {
	img.className = 'img-scale';
  setTimeout(move, 2000);
  setTimeout(removeOverlay, 6000);
}

// scaleOutLogo();
//

const anchorPoints = [ 'top-left','top-right',  'bottom-left', 'bottom-right'];


async function startAnimationLoop(){
  const youtubeData = await chunkArrayIntoArraysOfFour();
  
  scaleOutLogo();

  setTimeout( () => {
    saveAsHTMLElements( youtubeData[ 0 ]);
    runAnimationLoop( youtubeData );
  }, 500);
  
}

function runAnimationLoop( youtubeData ) {
  let activeChunkPosition = 1;
  const data = youtubeData;

  setInterval( () => {
    fadeOut()
      .then(() => {
        saveAsHTMLElements( data[ activeChunkPosition ] )

        if( activeChunkPosition === ( data.length - 1 ) ) {
          activeChunkPosition = 0;
        } else {
          activeChunkPosition++;
        }
      });
  }, 10000)

}

async function getYoutubeData() {

  // read our JSON
  let response = await fetch('data.json');
  let resJson = await response.json();
  let youtubeData = await resJson.youtube;
  // wait 1 second
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));

  return youtubeData;
}

async function saveAsHTMLElements( data ){

  const dataContainer = document.getElementById('data-container');

  return data.map((youtubeDataItem, i) => {
    const imageContainer = document.createElement('div');
    const title = document.createElement('h3');
    const titleBackground = document.createElement('div');

    title.className = 'title-style';
    titleBackground.className = 'title-background';
    title.innerHTML = youtubeDataItem.title;

    const image = document.createElement('img');
    image.src = youtubeDataItem.image;
    titleBackground.appendChild( title );

    imageContainer.appendChild( image );
    imageContainer.appendChild( titleBackground );

    imageContainer.className = 'data-item ' + anchorPoints[i] + ' scale-up';
    
    dataContainer.appendChild( imageContainer );
  });
}


startAnimationLoop();



async function chunkArrayIntoArraysOfFour() {
  const youtubeData = await getYoutubeData();
  let arrayOfFours = [];
  let i,j,chunkOfFour;
  for (i=0,j=youtubeData.length; i<j; i+=4) {
      chunkOfFour = youtubeData.slice(i,i+4);
      // console.log(chunkOfFour);
      arrayOfFours.push(chunkOfFour);
  }
 
  return arrayOfFours;
}


function fadeOut() {

  const containers = document.querySelectorAll('.data-item');

  console.log( containers );

  return new Promise( ( resolve, reject ) => {
    containers.forEach( container => {
      container.classList.remove('scale-up');
      container.classList.add('scale-down');
      setTimeout( () => {
        container.remove();    
        resolve();

      }, 2000)
    } )
  } )
  
}


