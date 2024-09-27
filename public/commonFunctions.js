function toggleClass(formId) {
    const forms = document.getElementsByClassName('toggle');
    Array.from(forms).forEach(form => {
        form.classList.add('hidden');
    });
    
    const currentForm = document.getElementById(formId);
    currentForm.classList.toggle('hidden');  
}

function openEditModal(oldId, newId, modalId, name) {
    document.getElementById(oldId).value = name;
    document.getElementById(newId).value = name; 
    document.getElementById(modalId).style.display = 'flex'; 
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none'; 
}

function confirmDelete(id, name, modalId) {
    document.getElementById(id).value = name; 
    document.getElementById(modalId).style.display = 'flex'; 
}
