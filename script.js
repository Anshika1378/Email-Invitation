//Global variables to hold parsed data
let recipients = [];

//Utility to escape HTML to prevent XSS risks in preview
function escapeHtml(text){
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

//Simple AI powered hook generator simulations
//In real app, replace this with an API call to an AI service
function generateAIHook(recipient){
    if(recipient.Achievement && recipient.Achievement.trim() !== ''){
        return `Your recent achievement of "${recipient.Achievement}" is a shining example driving India's growth. `;
    }
    return "We're excited about your impactful work and invitation to join us.";
}

//Replace placeholders in templates with recipient data
function personalizeEmail(template, recipient){
    let persoalized = template;

    //Replace placeholders like{FirstName},{Email},{Organization},{Achievment},{Role}

    Object.keys(recipient).forEach(key =>{
        const regex = new RegExp(`{${key}}`,'gi');
        persoalized = persoalized.replace(regex, recipient[key] || '');
    });

    //Insert ai hook separately
    persoalized = persoalized.replace(/{AIHook}/g,generateAIHook(recipient));

    return persoalized;
}

//Event :CSV file upload and parsing
document.getElementById('csvInput').addEventListener('change',function(e){
    const file = e.target.files[0];
    if(!file) return;

    Papa.parse(file,{
        header :true,
        skipEmptyLines : true,
        complete:function(results){
            recipients= results.data;
            if (recipients.length === 0){
                alert('CSV is empty or invalid.');
                document.getElementById('sendBtn').disabled = true;
                return;
            }
            alert(`Loaded ${recipients.length} recipients.`);
            document.getElementById('sendBtn').disabled = false;
            document.getElementById('previewContainer').innerHTML = '';
        },
        error: function(err){
            alert('Error parsing CSV:' + err.message);
        }
    });
}); 

//Event preview emails button
document.getElementById('previewBtn').addEventListener('click',()=>{
    if(recipients === 0){
        alert('Please upload a CSV file with recipients firse.');
        return;
    }

    const template = document.getElementById('emailTemplate').ariaValueMax;
    const container = document.getElementById('previewContainer');
    container.innerHTML = '';

    recipients.forEach((recipients, index) =>{
        const emailText = personalizeEmail(template, recipient);
        //show preview
        const previewDiv = document.createElement('div');
        previewDiv.className = 'email-preview';
        previewDiv.innerHTML = `<div class= "recipient-name">${escapeHtml(recipient.FirstName || 'Recipient')}(${escapeHtml(recipient.Email || '')})</div>
        <pre>${escapeHtml(emailText).substring(0,400)}${emailText.length > 400 ?'...': ''}</pre>`;
        container.appendChild(previewDiv);
    });
    container.scrollIntoView({behavior:'smooth'});
});

//Event :send emails button (simulation)
document.getElementById('sendBtn').addEventListener('click',()=>{
    if(recipients.length === 0){
        alert('Please upload a CSV file with recipient first.');
        return;
    }
    const emailsToSend = recipients.map(recipient => {
        return{
            to: recipient.Email,
            subject:'Invitation to VBDA 2025',
            body: personalizeEmail(template, recipient),
        };
    });

    //for demo, just log to console and alert user
    console.log('Simulated emails to send:', emailsToSend);
    alert(`Simulated sending ${emailsToSend.length} personalized emails.\nCheck console for details.`);
});