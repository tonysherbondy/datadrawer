import $ from 'jquery';

const clientId = 'f7e3bcac12583e7';
//const clientSecret = '855bb682ca82a7ca807a98c2c164fd6e57b703e9';

class ImgurApi {
  uploadPng(image) {
    return Promise.resolve($.ajax({
      url: `https://api.imgur.com/3/image`,
      headers: {
        'Authorization': `Client-ID ${clientId}`
      },
      method: 'POST',
      data: {
        type: 'base64',
        image
      }
    }));
  }
}

export default ImgurApi;
