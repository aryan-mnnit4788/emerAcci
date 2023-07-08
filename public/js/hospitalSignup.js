function getLatitudeAndLongitude() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            resolve({ latitude, longitude });
          },
          error => {
            reject(error.message);
          }
        );
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  }
  
  
  
  
  
  
  
  document.getElementById('signup-form').addEventListener('submit',async (event)=> {
    
  
  event.preventDefault();
  var longitude;
  var latitude;
  
  
  
  var hospitalName= document.getElementById('hospitalName').value;
  var address= document.getElementById('address').value;
  var email= document.getElementById('email').value;
  var password= document.getElementById('password').value;
  
  
  
  await getLatitudeAndLongitude()
    .then(location => {
       latitude = location.latitude;
       longitude = location.longitude;
      
      // Use the latitude and longitude values as needed
    })
    .catch(error => {
      console.log("Error occurred: " + error);
    });
  
  
  
      const data= {
      hospitalName :hospitalName,
      address : address,
      email: email,
      password: password,
      
      location :{
          type:"Point",
          coordinates: [longitude,latitude]
      }
  
      }
  
      
  
       
      
  
  
  
  
  
   
  
    
    
  
    // Send AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/hospitals/signup', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          // Successful response
          alert('Signup successful!');
          document.getElementById('signup-form').reset(); // Reset form fields
  
  
          window.location.href = '/hospitals/home';
  
        } else {
          // Error response
          alert('Signup failed. Please try again.');
        }
      }
    };
    xhr.send(JSON.stringify(data));
  });