const fs = require('fs');
const mammoth = require('mammoth');

const docx = fs.readFileSync('Weather_Forecast_API.docx');

mammoth.extractRawText({ buffer: docx })
  .then(result => {
    const documentContent = result.value.split('\n');
    const filteredArray = documentContent.filter(str => str !== '');
    let baseUrl = '';
    for (let i = 0; i < filteredArray.length; i++) {
      if (filteredArray[i] === '```') {
        baseUrl = filteredArray[i + 1];
        break;
      }
    }
    let api1Found = false;
    let api2Found = false;

    const api1Array = [];
    const api2Array = [];
    const api1Start = '### Get Current Weather';
    const api2Start = '### Get 7-Day Forecast';

    for (const line of filteredArray) {
      if (line === api1Start) {
        api1Found = true;
        api2Found = false;
        api1Array.push(line);
      } else if (line === api2Start) {
        api1Found = false;
        api2Found = true;
        api2Array.push(line);
      } else {
        if (api1Found) {
          api1Array.push(line);
        } else if (api2Found) {
          api2Array.push(line);
        }
      }
    }
    let data = {};
    let data2 = {};
    for (let i = 0; i < api1Array.length; i++) {
      if (api1Array[i].startsWith('### Get Current Weather')) {
        data = {
          ...data,
          method: api1Array[i + 3].split(' ')[0],
          path: api1Array[i + 3].split(' ')[1],
        };

      }
      if (api1Array[i].startsWith('**Parameters:**')) {
        data = {
          ...data,
          parameters: api1Array[i + 1].split('`')[1],
        };
      }
      if (api1Array[i].startsWith('**Example Request:**')) {
        data = {
          ...data,
          exampleRequest: {
            url: `${baseUrl}${api1Array[i + 2].split(' ')[1]}`,
            host: api1Array[i + 3].split(' ')[1],
            Authorization: api1Array[i + 4].split(' ')[1],
          },
        };
      }
      if (api1Array[i].startsWith('**Example Response:**')) {
        const closingCodeBlockIndex = api1Array.indexOf('```', i + 1);
        if (closingCodeBlockIndex !== -1) {
          const exampleResponseLines = api1Array.slice(i + 1, closingCodeBlockIndex + 1);
          const cleanedExampleResponse = exampleResponseLines.map(line => line.trim()).join('');
          data = {
            ...data,
            exampleResponse: cleanedExampleResponse.split('```json')[1],
          };
          i = closingCodeBlockIndex;
        }
      }
    }
    for (let i = 0; i < api2Array.length; i++) {
      if (api2Array[i].startsWith('### Get 7-Day Forecast')) {
        data2 = {
          ...data2,
          method: api2Array[i + 3].split(' ')[0],
          path: api2Array[i + 3].split(' ')[1],
        };

      }
      if (api2Array[i].startsWith('**Parameters:**')) {
        data2 = {
          ...data2,
          parameters: api2Array[i + 1].split('`')[1],
        };
      }
      if (api2Array[i].startsWith('**Example Request:**')) {
        data2 = {
          ...data2,
          exampleRequest: {
            url: `${baseUrl}${api2Array[i + 2].split(' ')[1]}`,
            host: api2Array[i + 3].split(' ')[1],
            Authorization: api2Array[i + 4].split(' ')[1],
          },
        };
      }
      if (api2Array[i].startsWith('**Example Response:**')) {
        const closingCodeBlockIndex = api2Array.indexOf('```', i + 1);
        if (closingCodeBlockIndex !== -1) {
          const exampleResponseLines = api2Array.slice(i + 1, closingCodeBlockIndex + 1);
          const cleanedExampleResponse = exampleResponseLines.map(line => line.trim()).join('');
          data2 = {
            ...data2,
            exampleResponse: cleanedExampleResponse.split('```json')[1],
          };
          i = closingCodeBlockIndex;
        }
      }
    }

    const combinedData = {
      "Base URL": baseUrl,
      "Get Current Weather": data,
      "Get 7-Day Forecast": data2,
    };

    console.log('API Data', combinedData)
  })
  .catch(error => {
    console.error('Error extracting text:', error);
  });
