/*function getLatitudeAndLongitude() {
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
      longitude: longitude,
      latitude:latitude
  
      }
  
      
  
       
      
  
  
  
  
  
   
  
    
    
  
    // Send AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/users/help', true);
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
  
*/
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

document.getElementById('messageForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  var longitude;
  var latitude;

  var message = document.getElementById("message").value;
  var phoneNumber = document.getElementById("phoneNumber").value;
  var address = document.getElementById("address").value;

  await getLatitudeAndLongitude()
    .then(location => {
      latitude = location.latitude;
      longitude = location.longitude;
    })
    .catch(error => {
      console.log("Error occurred: " + error);
    });

  const formData = new FormData();
  var avatarInput = document.getElementById('avatar');
  if (avatarInput.files.length > 0) {
    formData.append('avatar', avatarInput.files[0]);
  }
  formData.append('content', message);
  formData.append('phoneNumber', phoneNumber);
  formData.append('place', address);
  formData.append('longitude', longitude);
  formData.append('latitude', latitude);

  // Send AJAX request
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/users/help', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Successful response
        alert('Help request sent successfully!');
        document.getElementById('messageForm').reset(); // Reset form fields
        window.location.href = '/users/home';
      } else {
        // Error response
        alert('Failed. Please try again.');
      }
    }
  };
  xhr.send(formData);
});
