const path = require('path');
const fs = require('fs');
const imageToBase64 = require('image-to-base64');


const SVG_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 883" style="enable-background:new 0 0 1000 883;" xml:space="preserve">
    /*CODE*/

    <script  type="text/javascript">
    <![CDATA[
      const $bg = document.getElementById('BG')

      // hide all the layers
      for (let i=1; i<=31; i++) {
          document.getElementById('_' + i).style.display = 'none'
      }

      // get the number of todays date - so if it's the 2nd of april, that'd be 2
      let date = new Date().getDate()

      // make the right layer visible
      document.getElementById('_' + date).style.display = 'block'
      console.log('hello!')
    ]]>
  </script>
  </svg>
`

const BG = `<image id="BG" style="overflow:visible;enable-background:new    ;" width="1000" height="1000" href="data:image/png;base64,/*HREF*/" />`
const IMG = `<image style="overflow:visible;enable-background:new    ;" width="1000" height="883" id="/*ID*/" href="data:image/png;base64,/*HREF*/" />`

async function readDirAndConvert () {
  const dir = path.resolve(__dirname, 'example-images')
  fs.readdir(
    dir,
    async (err, files) => {
      if (err) throw err;
      
      // the file names were odd - quicker for me to rename them here
      const transformFileName = (name) => name.split('_')[2]
      const fileNameToNum = (name) => parseInt(transformFileName(name).split('.')[0])
      // sort the files with bg first
      const reorganisedFiles = files
        .filter(name => transformFileName(name))
        .sort((a, b) => fileNameToNum(a) > fileNameToNum(b) ? 1 : -1)
                                    
                              
      const bg64 = await imageToBase64(path.resolve(dir, reorganisedFiles.shift()))
      let imgSvg = BG.replace('/*HREF*/', bg64)
      
      for (let file of reorganisedFiles) {
        const base64 = await imageToBase64(path.resolve(dir, file))
        imgSvg += IMG.replace('/*ID*/', `${transformFileName(file).split('.')[0]}`).replace('/*HREF*/', base64)
      }

      const html = SVG_TEMPLATE.replace('/*CODE*/', imgSvg)
  
      fs.writeFileSync('./generated-svg/filename.svg', html)
      console.log('done')
    }
  );
}

readDirAndConvert()
