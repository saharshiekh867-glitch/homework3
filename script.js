// Homework 3 - client-side validation and dynamic behavior
function $(id){return document.getElementById(id)}
function setError(id, msg){$("err-"+id).textContent = msg || ''}
function formatCurrency(n){return n.toLocaleString(undefined,{style:'currency',currency:'USD',minimumFractionDigits:2})}
function onlyDigits(s){return s.replace(/\D/g,'')}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = $('patientForm');
  const salary = $('salary');
  const salaryDisplay = $('salaryDisplay');
  const validateBtn = $('validateBtn');
  const submitBtn = $('submitBtn');

  // Salary display
  function updateSalary(){ salaryDisplay.textContent = formatCurrency(Number(salary.value)); }
  salary.addEventListener('input', ()=>{ updateSalary(); validateSalary(); });
  updateSalary();

  // SSN formatting as you type
  $('ssn').addEventListener('input', (e)=>{
    const el = e.target;
    const digits = onlyDigits(el.value).slice(0,9);
    let out = digits;
    if(digits.length>5) out = digits.slice(0,3)+'-'+digits.slice(3,5)+'-'+digits.slice(5);
    else if(digits.length>3) out = digits.slice(0,3)+'-'+digits.slice(3);
    el.value = out;
    validateSSN();
  });

  // Add listeners for inline validation
  ['firstName','middleInitial','lastName','dobMonth','dobDay','dobYear','addr1','addr2','city','state','zip','email','comments','userId','password','confirmPassword'].forEach(id=>{
    const el = $(id); if(!el) return;
    el.addEventListener('blur', ()=>{ validateField(id); });
    el.addEventListener('input', ()=>{ validateField(id); });
  });

  // Checkboxes and radios (validate on change)
  document.querySelectorAll('input[name="symptom"]').forEach(cb=>cb.addEventListener('change', validateSymptoms));
  document.querySelectorAll('input[name="housing"]').forEach(r=>r.addEventListener('change', validateHousing));
  document.querySelectorAll('input[name="vaccinated"]').forEach(r=>r.addEventListener('change', validateVaccinated));

  validateBtn.addEventListener('click', (e)=>{ e.preventDefault(); runAllValidations(); });
  form.addEventListener('submit', (e)=>{
    e.preventDefault(); if(runAllValidations()){ window.location = 'thankyou.html'; }
  });

  function validateField(id){
    switch(id){
      case 'firstName': return validateName('firstName', true);
      case 'middleInitial': return validateMiddle();
      case 'lastName': return validateName('lastName', true);
      case 'dobMonth':
      case 'dobDay':
      case 'dobYear': return validateDOB();
      case 'ssn': return validateSSN();
      case 'addr1': return validateAddr1();
      case 'addr2': return validateAddr2();
      case 'city': return validateCity();
      case 'state': return validateState();
      case 'zip': return validateZip();
      case 'email': return validateEmail();
      case 'comments': return validateComments();
      case 'userId': return validateUserId();
      case 'password':
      case 'confirmPassword': return validatePasswords();
    }
    return true;
  }

  function validateName(id, required){
    const v = $(id).value.trim();
    if(required && v.length===0){ setError(id,'Required'); return false; }
    if(v.length>30){ setError(id,'Max 30 characters'); return false; }
    if(v && !/^[a-zA-Z\-']+$/.test(v)) { setError(id,'Letters, apostrophes, hyphens only'); return false; }
    setError(id,''); return true;
  }
  function validateMiddle(){ const v = $('middleInitial').value.trim(); if(!v){ setError('middleInitial',''); return true; } if(!/^[A-Za-z]$/.test(v)){ setError('middleInitial','Single letter only'); return false; } setError('middleInitial',''); return true; }

  function validateDOB(){
    const m = $('dobMonth').value.trim(); const d = $('dobDay').value.trim(); const y = $('dobYear').value.trim();
    if(!m && !d && !y){ setError('dob','Date of birth is required'); return false; }
    const mm = parseInt(m,10), dd = parseInt(d,10), yy = parseInt(y,10);
    if(Number.isNaN(mm)||Number.isNaN(dd)||Number.isNaN(yy)){ setError('dob','Invalid date components'); return false; }
    const date = new Date(yy, mm-1, dd);
    if(date.getFullYear()!==yy || date.getMonth()!==mm-1 || date.getDate()!==dd){ setError('dob','DOB is invalid'); return false; }
    const today = new Date(); if(date>today){ setError('dob','DOB cannot be in the future'); return false; }
    const age = Math.floor((today - date)/(365.25*24*3600*1000)); if(age>120){ setError('dob','Age > 120 years'); return false; }
    setError('dob',''); return true;
  }

  function validateSSN(){ const el = $('ssn'); const digits = onlyDigits(el.value); if(digits.length!==9){ setError('ssn','SSN must be 9 digits'); return false; } setError('ssn',''); return true; }

  function validateAddr1(){ const v = $('addr1').value.trim(); if(!v){ setError('addr1','Address required'); return false; } if(v.length<2){ setError('addr1','Too short'); return false; } setError('addr1',''); return true; }
  function validateAddr2(){ const v = $('addr2').value.trim(); if(!v){ setError('addr2',''); return true; } if(v.length<2){ setError('addr2','Too short'); return false; } setError('addr2',''); return true; }
  function validateCity(){ const v = $('city').value.trim(); if(!v){ setError('city','City required'); return false; } if(!/^[a-zA-Z .'\-]{2,30}$/.test(v)) { setError('city','Invalid characters'); return false; } setError('city',''); return true; }
  function validateState(){ const v = $('state').value; if(!v){ setError('state','State is required'); return false; } setError('state',''); return true; }
  function validateZip(){ const v = onlyDigits($('zip').value); if(v.length!==5){ setError('zip','Zip code must be 5 digits'); return false; } setError('zip',''); return true; }
  function validateEmail(){ const v = $('email').value.trim().toLowerCase(); $('email').value = v; if(!v){ setError('email','Email is required'); return false; } const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; if(!re.test(v)){ setError('email','Invalid email format'); return false; } setError('email',''); return true; }
  function validateComments(){ const v = $('comments').value.trim(); if(v.length>500){ setError('comments','Max 500 characters'); return false; } setError('comments',''); return true; }

  function validateSymptoms(){ const checked = document.querySelectorAll('input[name="symptom"]:checked').length; if(checked===0){ setError('symptoms','At least one should be checked'); return false; } setError('symptoms',''); return true; }
  function validateHousing(){ const sel = document.querySelector('input[name="housing"]:checked'); if(!sel){ setError('housing','Please choose housing'); return false; } setError('housing',''); return true; }
  function validateVaccinated(){ const sel = document.querySelector('input[name="vaccinated"]:checked'); if(!sel){ setError('vaccinated','Vaccination required'); return false; } setError('vaccinated',''); return true; }
  function validateSalary(){ const val = Number(salary.value); if(isNaN(val)){ setError('salary','Salary must be a number'); return false; } if(val<20000||val>200000){ setError('salary','Salary out of range'); return false; } setError('salary',''); return true; }

  function validateUserId(){ let v = $('userId').value.trim(); $('userId').value = v; if(!v){ setError('userId','User ID required'); return false; } if(v.length<5||v.length>20){ setError('userId','Must be 5-20 characters'); return false; } if(/^[0-9]/.test(v)){ setError('userId','Cannot start with a number'); return false; } if(!/^[A-Za-z0-9_-]+$/.test(v)){ setError('userId','Only letters, numbers, -, _ allowed'); return false; } setError('userId',''); return true; }

  function validatePasswords(){ const p = $('password').value; const c = $('confirmPassword').value; if(!p){ setError('password','Password required'); return false; } if(p.length<8){ setError('password','At least 8 characters'); return false; } if(!/[A-Z]/.test(p)||!/[a-z]/.test(p)||!/[0-9]/.test(p)){ setError('password','Requires upper, lower and digit'); return false; } if(p===$('userId').value){ setError('password','Password cannot equal user ID'); return false; } setError('password',''); if(p!==c){ setError('confirmPassword','Passwords do not match'); return false; } setError('confirmPassword',''); return true; }

  function runAllValidations(){
    const results = [
      validateName('firstName',true), validateMiddle(), validateName('lastName',true), validateDOB(), validateSSN(),
      validateAddr1(), validateAddr2(), validateCity(), validateState(), validateZip(), validateEmail(),
      validateComments(), validateSymptoms(), validateHousing(), validateVaccinated(), validateSalary(),
      validateUserId(), validatePasswords()
    ];
    const ok = results.every(Boolean);
    submitBtn.disabled = !ok; return ok;
  }

}
                         
);
