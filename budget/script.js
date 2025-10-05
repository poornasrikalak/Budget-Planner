// -------------------- STORAGE --------------------
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser") || null;
let expenses = JSON.parse(localStorage.getItem("expenses")) || {};
let editIndex = null;
let generatedOtp = null;

// -------------------- AUTH --------------------
function hideAll() {
  document.querySelectorAll(".card, #dashboard, #profile-view").forEach(el => el.classList.add("hidden"));
}

function showLogin() { hideAll(); document.getElementById("login-card").classList.remove("hidden"); }
function showRegister() { hideAll(); document.getElementById("register-card").classList.remove("hidden"); }
function showProfileForm() { hideAll(); document.getElementById("profile-card").classList.remove("hidden"); }

// -------------------- OTP --------------------
function sendOtp() {
  generatedOtp = Math.floor(1000 + Math.random() * 9000);
  alert("OTP sent: " + generatedOtp);
}

// -------------------- REGISTER --------------------
function register() {
  let email = document.getElementById("regEmail").value.trim();
  let pass = document.getElementById("regPassword").value.trim();
  let otp = document.getElementById("otp").value.trim();

  if (parseInt(otp) !== generatedOtp) { alert("❌ Invalid OTP"); return; }
  if (!email || !pass) { alert("⚠️ Fill all details"); return; }

  users[email] = { password: pass, profile: null };
  localStorage.setItem("users", JSON.stringify(users));
  generatedOtp = null;
  alert("✅ Registration successful! Login now.");
  showLogin();
}

// -------------------- LOGIN --------------------
function login() {
  let email = document.getElementById("loginEmail").value.trim();
  let pass = document.getElementById("loginPassword").value.trim();

  if (users[email] && users[email].password === pass) {
    currentUser = email;
    localStorage.setItem("currentUser", currentUser);
    if (!expenses[currentUser]) expenses[currentUser] = [];
    localStorage.setItem("expenses", JSON.stringify(expenses));

    alert("🎉 Login successful!");
    if (!users[email].profile || users[email].profile.salary <= 0) showProfileForm();
    else showDashboard();
  } else alert("❌ Invalid email/password");
}

// -------------------- PROFILE --------------------
function saveProfile() {
  let profile = {
    name: document.getElementById("name").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    age: document.getElementById("age").value.trim(),
    profession: document.getElementById("profession").value.trim(),
    workspace: document.getElementById("workspace").value.trim(),
    salary: parseFloat(document.getElementById("salary").value) || 0,
    savingsPercent: parseFloat(document.getElementById("savingsPercent").value) || 0
  };

  if (!profile.name || !profile.mobile || !profile.salary || profile.salary <= 0) {
    alert("⚠️ Please fill all required fields with a valid salary (>0).");
    return;
  }

  users[currentUser].profile = profile;
  if (!expenses[currentUser]) expenses[currentUser] = [];

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("expenses", JSON.stringify(expenses));

  alert("✅ Profile saved successfully!");
  showDashboard();
}

function viewProfile() {
  hideAll();
  let profile = users[currentUser].profile;
  document.getElementById("profileDetails").innerHTML = `
    Name: ${profile.name}<br>
    Mobile: ${profile.mobile}<br>
    Age: ${profile.age}<br>
    Profession: ${profile.profession}<br>
    Workspace: ${profile.workspace}<br>
    Salary: ₹${profile.salary}<br>
    Savings %: ${profile.savingsPercent}
  `;
  document.getElementById("profile-view").classList.remove("hidden");
}

function editProfile() {
  showProfileForm();
  let profile = users[currentUser].profile;
  document.getElementById("name").value = profile.name;
  document.getElementById("mobile").value = profile.mobile;
  document.getElementById("age").value = profile.age;
  document.getElementById("profession").value = profile.profession;
  document.getElementById("workspace").value = profile.workspace;
  document.getElementById("salary").value = profile.salary;
  document.getElementById("savingsPercent").value = profile.savingsPercent;
}

function closeProfile() { showDashboard(); }
function newProfile() { users[currentUser].profile = null; showProfileForm(); }
function logout() { currentUser = null; localStorage.removeItem("currentUser"); alert("👋 Logged out"); showLogin(); }

// -------------------- DASHBOARD --------------------
function showDashboard() {
  hideAll();
  document.getElementById("dashboard").classList.remove("hidden");
  updateSummary();
}

// -------------------- EXPENSES --------------------
function addExpense() {
  let profile = users[currentUser].profile;
  if (!profile || profile.salary <= 0) { alert("⚠️ Complete profile first."); showProfileForm(); return; }

  let name = document.getElementById("expenseName").value.trim();
  let amt = parseFloat(document.getElementById("expenseAmount").value);
  let date = document.getElementById("expenseDate").value;

  if (!name || isNaN(amt) || !date) { alert("⚠️ Fill all expense fields"); return; }

  let savingsAmt = (profile.salary * profile.savingsPercent) / 100;
  let available = profile.salary - savingsAmt;
  let totalSpent = expenses[currentUser].reduce((sum,e)=>sum+e.amt,0);

  if (totalSpent + amt > available) { alert("❌ Cannot spend! Not enough money."); return; }

  expenses[currentUser].push({ name, amt, date });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  clearExpenseForm();
  updateSummary();
  alert("✅ Expense added!");
}

function editExpense(i) {
  editIndex = i;
  let exp = expenses[currentUser][i];
  document.getElementById("expenseName").value = exp.name;
  document.getElementById("expenseAmount").value = exp.amt;
  document.getElementById("expenseDate").value = exp.date;
  document.getElementById("formTitle").innerText = "Edit Expense";
  document.getElementById("add-expense-btn").classList.add("hidden");
  document.getElementById("update-expense-btn").classList.remove("hidden");
}

function updateExpense() {
  let profile = users[currentUser].profile;
  let name = document.getElementById("expenseName").value.trim();
  let amt = parseFloat(document.getElementById("expenseAmount").value);
  let date = document.getElementById("expenseDate").value;

  if (!name || isNaN(amt) || !date) { alert("⚠️ Fill all expense fields"); return; }

  let savingsAmt = (profile.salary * profile.savingsPercent) / 100;
  let available = profile.salary - savingsAmt;
  let totalSpent = expenses[currentUser].reduce((sum, e, idx) => sum + (idx === editIndex ? 0 : e.amt), 0);

  if (totalSpent + amt > available) { alert("❌ Cannot spend! Not enough money."); return; }

  expenses[currentUser][editIndex] = { name, amt, date };
  localStorage.setItem("expenses", JSON.stringify(expenses));
  clearExpenseForm();
  updateSummary();
  alert("✅ Expense updated!");
}

function deleteExpense(i) {
  if (confirm("🗑️ Delete this expense?")) {
    expenses[currentUser].splice(i, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateSummary();
    alert("✅ Deleted!");
  }
}

function clearExpenseForm() {
  document.getElementById("expenseName").value = "";
  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseDate").value = "";
  document.getElementById("formTitle").innerText = "Add Expense";
  document.getElementById("add-expense-btn").classList.remove("hidden");
  document.getElementById("update-expense-btn").classList.add("hidden");
  editIndex = null;
}

// -------------------- SUMMARY --------------------
function updateSummary() {
  let profile = users[currentUser].profile;
  let tbody = document.querySelector("#expenseTable tbody");
  tbody.innerHTML = "";
  let total = 0;

  expenses[currentUser].forEach((e,i)=>{
    total += e.amt;
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${e.name}</td>
      <td>₹${e.amt}</td>
      <td>${e.date}</td>
      <td class="actions">
        <button onclick="editExpense(${i})">Edit</button>
        <button onclick="deleteExpense(${i})">Delete</button>
      </td>`;
    tbody.appendChild(row);
  });

  let savingsAmt = (profile.salary * profile.savingsPercent) / 100;
  let available = profile.salary - savingsAmt;
  let balance = available - total;

  document.getElementById("salaryDisplay").textContent = "Salary: ₹" + profile.salary;
  document.getElementById("savingsDisplay").textContent = `Savings (${profile.savingsPercent}%): ₹${savingsAmt}`;
  document.getElementById("availableDisplay").textContent = "Available for Expenses: ₹" + available;
  document.getElementById("totalExpenses").textContent = "Total Expenses: ₹" + total;
  document.getElementById("balanceDisplay").textContent = "Balance Left: ₹" + balance;

  let balanceWarning = document.getElementById("balanceWarning");
  if (balance <= 0) balanceWarning.textContent = "❌ No money left! Stop spending.";
  else if (balance <= available * 0.1) balanceWarning.textContent = "⚠️ Balance low! Save money.";
  else balanceWarning.textContent = "";
}

// -------------------- CHATBOT --------------------
const toggleBtn = document.getElementById("chatbot-toggle");
const chatBox = document.getElementById("chatbot-box");
const chatMessages = document.getElementById("chatbot-messages");
const chatInput = document.getElementById("chatbot-input");
const chatSend = document.getElementById("chatbot-send");

toggleBtn.addEventListener("click", () => { chatBox.classList.toggle("hidden"); chatInput.focus(); });
chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => { if (e.key==="Enter") sendMessage(); });

async function sendMessage() {
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  chatMessages.innerHTML += `<div><b>You:</b> ${userMsg}</div>`;
  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const typingDiv = document.createElement("div");
  typingDiv.innerHTML = `<b>Bot:</b> typing...`;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg })
    });

    const data = await response.json();
    typingDiv.innerHTML = `<b>Bot:</b> ${data.reply}`;
  } catch (err) {
    typingDiv.innerHTML = `<b>Bot:</b> Error.`;
    console.error(err);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// -------------------- ON LOAD --------------------
window.onload = () => {
  if (currentUser && users[currentUser]) {
    if(!users[currentUser].profile || users[currentUser].profile.salary <=0) showProfileForm();
    else showDashboard();
  } else showLogin();
  if(currentUser && !expenses[currentUser]) expenses[currentUser]=[];
};
