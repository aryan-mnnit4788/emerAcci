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
  
  
  
  
  
  
  document.addEventListener("DOMContentLoaded",async function() {
    var updateButton = document.querySelector(".update-button");
  
    updateButton.addEventListener("click", async function(event) {
      event.preventDefault();

      var longitude;
       var latitude;
       await getLatitudeAndLongitude()
       .then(location => {
          latitude = location.latitude;
          longitude = location.longitude;
         
         // Use the latitude and longitude values as needed
       })
       .catch(error => {
         console.log("Error occurred: " + error);
       });
     
  
      // Get the password input value
      var passwordInput = document.getElementById("password");
      var newPassword = passwordInput.value;
  
      
  
      // Set the request payload
      var data= {
        password: newPassword,
        location :{
            type:"Point",
            coordinates: [longitude,latitude]
        }
      };
  
      // Convert the payload to JSON
      
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/hospitals/update/me', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            // Successful response
            alert('Update successful!');
            
    
    
            window.location.href = '/hospitals/home';
    
          } else {
            // Error response
            alert('Signup failed. Please try again.');
          }
        }
      };
      xhr.send(JSON.stringify(data));
      
    });
  });