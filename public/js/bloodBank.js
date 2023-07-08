document.getElementById('bloodBankForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission behavior

    var formData = new FormData(this); // Get the form data
    var bloodBankData = {};
    for (var pair of formData.entries()) {
        var bloodType = pair[0];
        var availability = pair[1];
        bloodBankData[bloodType] = availability;
    }

console.log(bloodBankData)
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/hospitals/update/bloodBank', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
           alert('Update Successful!');
            console.log(xhr.responseText);
        }
    };

    xhr.send(JSON.stringify(bloodBankData)); 
});