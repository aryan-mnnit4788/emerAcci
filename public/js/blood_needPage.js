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
  
  
  
  
  
  
  
  document.getElementById('messageForm').addEventListener('submit',async (event)=> {
    
  
  event.preventDefault();
  var longitude;
  var latitude;
  
  
  
  var message = document.getElementById("message").value;
  var phoneNumber = document.getElementById("phoneNumber").value;
  var address = document.getElementById("address").value;
  var bloodGroup = document.getElementById("bloodGroup").value;

  
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
      content: message,
      phoneNumber:phoneNumber,
      place: address,
      bloodGroup: bloodGroup,
      longitude: longitude,
      latitude:latitude
  
      }
  
      
  
       
      
  
  
  
  
  
   
  
    
    
  
    // Send AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/users/blood_need', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          // Successful response
          alert('Help request send successfully!');
          document.getElementById('messageForm').reset(); // Reset form fields
  
  
          window.location.href = '/users/home';
  
        } else {
          // Error response
          alert('Failed. Please try again.');
        }
      }
    };
    xhr.send(JSON.stringify(data));
  });