const img = document.getElementById('img-rescale');

function move() {
	img.classList.add('img-move');
}

function removeOverlay() {
  img.classList.add('img-moved');
  img.src = 'red-youTube_logo.png';
  document.getElementById('intro-overlay').remove();
}

function scaleOutLogo() {
	img.className = 'img-scale';
  setTimeout(move, 2000);

  setTimeout(removeOverlay, 6000);
  // img.style.width = '30%';
  // img.style.top = '10';
  // img.style.left = '10';


  // await removeOverlay();
}

scaleOutLogo();
//

const anchorPoints = [  'top-left','top-right',  'bottom-left', 'bottom-right'];


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
  console.log( data );
  const dataContainer = document.getElementById('data-container');

  // console.log(await chunkArrayIntoArraysOfFour());
  // const youtubeData = await chunkArrayIntoArraysOfFour();
  return data.map((youtubeDataItem, i) => {
    const imageContainer = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'title-style';
    title.innerHTML = youtubeDataItem.title;
    const image = document.createElement('img');
    image.src = youtubeDataItem.image;
    imageContainer.appendChild( image );
    imageContainer.appendChild( title );
    imageContainer.className = 'data-item ' + anchorPoints[i] + ' scale-up';
    
    dataContainer.appendChild( imageContainer );
  });
}

setTimeout(init, 1000);

async function init() {
  const youtubeData = await chunkArrayIntoArraysOfFour();
  let isFirstRender = true;
  let activeChunkPosition = 0;
  setInterval( () => {

    if( isFirstRender ) {
      saveAsHTMLElements( youtubeData[ activeChunkPosition ] );
      isFirstRender = false;
    } else {
      // console.log( 'fade out' );
      fadeOut()
        .then( () => {
          saveAsHTMLElements( youtubeData[ activeChunkPosition ] );
        } )
    }

    if( activeChunkPosition === ( youtubeData.length - 1 ) ) {
      activeChunkPosition = 0;
    } else {
      activeChunkPosition++;
    }

  }, 10000)
}


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


// fetch for json


// function getData(){
//   const responseData = fetch('data.json', {
//       method: 'get',
//       headers: new Headers({
//       'Content-Type': 'text/plain'
//     })
//   }).then(
//       res => {
//         res.json()
//     .then(data => {
//         console.log(data.youtube);
//         });
//       }
//     )
//     .catch(function(err) {
//       console.log('Fetch Error ', err);
//     });

//     return responseData;
// }

// getData();



// fetch for CORS

// fetch('https://cors-anywhere.herokuapp.com/http://cultural-screens-api.labs.house/youtube/mostpopular/', {
//     method: 'get',
//     headers: new Headers({
// 		'Content-Type': 'text/plain'
// 	})
// }).then(
//     res => {
//       if (res.status !== 200) {
//         console.log('Looks like there was a problem. Status Code: ' +
//           res.status);
//         return;
//       }
//       res.json().then(data =>{
//         console.log(data);
//       });
//     }
//   )
//   .catch(function(err) {
//     console.log('Fetch Error ', err);
//   });
  