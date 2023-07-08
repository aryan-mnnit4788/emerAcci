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
   // event.preventDefault(); // Prevent form submission
    


/*

   const data1= {
    "firstName":"Prashant",
    "lastName": "Singh",
    "email": "singhabhi30020@gmail.com",
    "password": "123456789",
    "bloodGroup":"AB+",
    "location" :{
        "type":"Point",
        "coordinates": [76.4520707,29.78467]
    }
    
};

 const respone = await fetch("http://localhost:3000/users/signup", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(data1),
      });

*/

event.preventDefault();
var longitude;
var latitude;



var firstName= document.getElementById('firstName').value;
var lastName= document.getElementById('lastName').value;
var email= document.getElementById('email').value;
var password= document.getElementById('password').value;
var bloodGroup= document.getElementById('bloodGroup').value;


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
    firstName :firstName,
    lastName : lastName,
    email: email,
    password: password,
    bloodGroup: bloodGroup,
    location :{
        type:"Point",
        coordinates: [longitude,latitude]
    }

    }

    

     
    





 

  
  

  // Send AJAX request
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/users/signup', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Successful response
        alert('Signup successful!');
        document.getElementById('signup-form').reset(); // Reset form fields


        window.location.href = '/users/home';

      } else {
        // Error response
        alert('Signup failed. Please try again.');
      }
    }
  };
  xhr.send(JSON.stringify(data));
});