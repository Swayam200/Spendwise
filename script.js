const hamburger = document.getElementById("hamburger");
const navigator = document.getElementById("Navigator");
const bar1 = document.getElementById("bar1");
const bar2 = document.getElementById("bar2");
const bar3 = document.getElementById("bar3");
const ul = document.getElementById("ul");
const addBtn = document.getElementById("add");
const titleInput = document.getElementById("expense-title");
const amountInput = document.getElementById("expense-amount");
const dateInput = document.getElementById("expense-date");
const timeInput = document.getElementById("expense-time");
const categoryInput = document.getElementById("expense-category");
const totalAmountCell = document.getElementById("total-amount");
const expensesTableBody = document.getElementById("tableBody");
const currencySelect = document.getElementById("currency-select");
let currentCurrency = "USD";

// Example exchange rates (for demonstration purposes only)
const exchangeRates = {
  USD: 1,
  EUR: 0.85,
  INR: 75,
  GBP: 0.75,
};

function convertCurrency(amount, toCurrency) {
  return (amount * exchangeRates[toCurrency]).toFixed(2);
}

currencySelect.addEventListener("change", () => {
  currentCurrency = currencySelect.value;

  // Update displayed amounts
  expenses.forEach((expense) => {
    expense.convertedAmount = convertCurrency(expense.amount, currentCurrency);
  });
  renderExpenses();
});


document.getElementById("export-excel").addEventListener("click", () => {
  const rows = [["Title", "Amount", "Date", "Category"]];
  expenses.forEach((expense) => {
    rows.push([expense.title, `${currentCurrency} ${expense.convertedAmount || expense.amount}`, expense.date, expense.category]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  XLSX.writeFile(workbook, "expenses.xlsx");
});

document.getElementById("export-pdf").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();
  doc.text("Expense Tracker", 20, 10);

  const rows = expenses.map((expense) => [
    expense.title,
    `${currentCurrency} ${expense.convertedAmount || expense.amount}`,
    expense.date,
    expense.category,
  ]);

  doc.autoTable({
    head: [["Title", "Amount", "Date", "Category"]],
    body: rows,
    startY: 20, // Ensure table doesn't overlap with the title
  });

  doc.save("expenses.pdf");
});



// Initialize expenses array from localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let totalAmount = 0;
let currentEditIndex = null;

// Function to render expenses
function renderExpenses() {
  expensesTableBody.innerHTML = "";
  totalAmount = 0;

  expenses.forEach((expense, index) => {
    const newRow = expensesTableBody.insertRow();

    const titleCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const categoryCell = newRow.insertCell();
    const editCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();

    const editBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");

    // Edit button
    editBtn.textContent = "Edit";
    editBtn.classList.add(
      "mx-auto",
      "my-[7px]",
      "p-2",
      "min-w-[80px]",
      "bg-[#377f8e]",
      "text-white",
      "text-base",
      "font-normal",
      "hover:bg-[#1f3c42]"
    );

    // Delete button
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add(
      "mx-auto",
      "my-[7px]",
      "p-2",
      "min-w-[80px]",
      "bg-[#377f8e]",
      "text-white",
      "text-base",
      "font-normal",
      "hover:bg-[#1f3c42]"
    );

    // Add cell classes
    titleCell.classList.add("border-[1px]", "border-r-[#377f8e]", "px-4");
    amountCell.classList.add("border-[1px]", "border-r-[#377f8e]", "px-4", "text-center");
    dateCell.classList.add("border-[1px]", "border-r-[#377f8e]", "px-4", "text-center");
    categoryCell.classList.add("border-[1px]", "border-r-[#377f8e]", "px-4", "text-center");
    editCell.classList.add("border-[1px]", "border-r-[#377f8e]", "text-center");
    deleteCell.classList.add("border-[1px]", "text-center");

    titleCell.textContent = expense.title;
    amountCell.textContent = `${currentCurrency} ${expense.convertedAmount || expense.amount}`;
    dateCell.textContent = `${expense.date} ${expense.time}`;
    categoryCell.textContent = expense.category;

    // Create wrapper divs for buttons to ensure proper centering
    const editWrapper = document.createElement("div");
    editWrapper.classList.add("flex", "justify-center");
    editWrapper.appendChild(editBtn);
    editCell.appendChild(editWrapper);

    const deleteWrapper = document.createElement("div");
    deleteWrapper.classList.add("flex", "justify-center");
    deleteWrapper.appendChild(deleteBtn);
    deleteCell.appendChild(deleteWrapper);

    totalAmount += parseFloat(expense.amount);

    // Edit button click handler
    editBtn.addEventListener("click", () => {
      currentEditIndex = index;
      titleInput.value = expense.title;
      amountInput.value = expense.amount;
      dateInput.value = expense.date;
      timeInput.value = expense.time;
      categoryInput.value = expense.category;
      addBtn.textContent = "Update Expense";
    });

    // Delete button click handler
    deleteBtn.addEventListener("click", () => {
      expenses.splice(index, 1);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
      drawChart(window.innerWidth);
    });
  });

  const convertedTotalAmount = convertCurrency(totalAmount, currentCurrency);
  totalAmountCell.textContent = `${currentCurrency} ${convertedTotalAmount}`;

  // Generate Insights
  generateAISummary();
}



// Add/Update expense handler
addBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const time = timeInput.value;
  const category = categoryInput.value;

  // Validation
  if (!title || isNaN(amount) || amount <= 0 || !date || !time || !category) {
    alert("Please fill all fields correctly.");
    return;
  }

  const expenseData = { title, amount, date, time, category };

  if (currentEditIndex !== null) {
    // Update existing expense
    expenses[currentEditIndex] = expenseData;
    currentEditIndex = null;
    addBtn.textContent = "Add Expense";
  } else {
    // Add new expense
    expenses.push(expenseData);
  }

  localStorage.setItem("expenses", JSON.stringify(expenses));

  renderExpenses();
  drawChart(window.innerWidth);
  resetForm();
});

// Function to reset form
function resetForm() {
  titleInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
  categoryInput.value = "personal";
  addBtn.textContent = "Add Expense";
  currentEditIndex = null;
}

// Render expenses on page load
renderExpenses();

window.addEventListener("resize", function () {
  var windowWidth = window.innerWidth;

  if (windowWidth <= 1023) {
    navigator.classList.remove("flex");
    ul.classList.remove("flex");
  } else {
    navigator.classList.add("flex");
    ul.classList.add("flex");
  }
  drawChart(windowWidth);
});

// Hamburger Menu
function hamburgers() {
  if (bar1.classList.contains("rotate-45")) {
    bar1.classList.remove("translate-y-[10px]", "rotate-45");
    bar1.classList.add("translate-y-0", "rotate-0");
    bar2.classList.remove("opacity-0");
    bar3.classList.remove("translate-y-[-6px]", "-rotate-45");
    bar3.classList.add("translate-y-0", "rotate-0");
    navigator.classList.add("max-lg:hidden");
  } else {
    bar1.classList.remove("translate-y-0", "rotate-0");
    bar1.classList.add("translate-y-[10px]", "rotate-45");
    bar2.classList.add("opacity-0");
    bar3.classList.remove("translate-y-0", "rotate-0");
    bar3.classList.add("translate-y-[-6px]", "-rotate-45");
    navigator.classList.remove("max-lg:hidden");
  }
}

// Render Charts and Graphs
function drawChart(windowWidth) {
  if (expenses.length === 0) {
    document.getElementById("bar").innerHTML = "<p class='my-6'>No Data to Show !!</p>";
    document.getElementById("pie").innerHTML = "<p class='my-6'>No Data to Show !!</p>";
    return;
  }

  // Initialize chart data
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const categoryIndex = acc.findIndex(
        (item) => item[0] === expense.category
      );
      if (categoryIndex === -1) {
        acc.push([expense.category, parseFloat(expense.amount)]);
      } else {
        acc[categoryIndex][1] += parseFloat(expense.amount);
      }
      return acc;
    },
    [["Category", "Amount"]]
  );

  const data = google.visualization.arrayToDataTable(categoryData);

  let barOptions, pieOptions;
  if (windowWidth > 800) {
    barOptions = {
      title: "Weekly Expenses",
      width: 800,
      height: 400,
      colors: ["#377f8e"],
    };
    pieOptions = {
      width: 800,
      height: 400,
      colors: ["#377f8e", "#1f3c42", "#7fb0ba"],
      is3D: true,
    };
  } else if (windowWidth > 500) {
    barOptions = {
      title: "Weekly Expenses",
      width: 600,
      height: 400,
      colors: ["#377f8e"],
    };
    pieOptions = {
      width: 600,
      height: 400,
      colors: ["#377f8e", "#1f3c42", "#7fb0ba"],
      is3D: true,
    };
  } else {
    barOptions = {
      title: "Weekly Expenses",
      width: 460,
      height: 400,
      colors: ["#377f8e"],
    };
    pieOptions = {
      width: 460,
      height: 400,
      colors: ["#377f8e", "#1f3c42", "#7fb0ba"],
      is3D: true,
    };
  }

  // Create chart instances
  const barChart = new google.visualization.BarChart(
    document.getElementById("bar")
  );
  const pieChart = new google.visualization.PieChart(
    document.getElementById("pie")
  );

  // Draw the charts
  barChart.draw(data, barOptions);
  pieChart.draw(data, pieOptions);
}

// Call the drawChart function when the page loads and on window resize
google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(() => drawChart(window.innerWidth));

// Listen to window resize and redraw the charts
window.addEventListener("resize", function () {
  drawChart(window.innerWidth);
});

// Get the button element
const scrollButton = document.getElementById("scrollButton");

// Show the button when the user scrolls down 200px from the top
window.onscroll = () => {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollButton.style.display = "block";
  } else {
    scrollButton.style.display = "none";
  }
};

// Scroll to the top when the button is clicked
scrollButton.onclick = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// Select the button
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Add an event listener to the button for dark mode toggle
darkModeToggle.addEventListener('click', (event) => {
  // Prevent event bubbling
  event.stopPropagation();

  // Toggle the 'dark' class on the body
  document.body.classList.toggle('dark');

  // Change the button text based on the current mode
  if (document.body.classList.contains('dark')) {
    darkModeToggle.textContent = 'Light Mode';
  } else {
    darkModeToggle.textContent = 'Dark Mode';
  }
});

function generateAISummary() {
  const insights = [];

  // Calculate category totals and convert them to the current currency
  const categoryTotals = expenses.reduce((totals, expense) => {
    const convertedAmount = parseFloat(convertCurrency(expense.amount, currentCurrency));
    totals[expense.category] = (totals[expense.category] || 0) + convertedAmount;
    return totals;
  }, {});

  // Example AI Insights
  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (highestCategory) {
    insights.push(`You spend the most on "${highestCategory[0]}" with a total of ${currentCurrency} ${highestCategory[1].toFixed(2)}.`);
  }

  const totalSpent = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  if (totalSpent > 1000) { // Adjust threshold as needed
    insights.push(`Your total spending this month is high (${currentCurrency} ${totalSpent.toFixed(2)}). Consider optimizing your budget.`);
  } else {
    insights.push(`Your total spending this month is within a healthy range (${currentCurrency} ${totalSpent.toFixed(2)}). Keep it up!`);
  }

  // Add suggestions
  insights.push("Tip: Review your subscriptions to identify unnecessary expenses.");

  // Populate the AI Summary section
  const aiSummary = document.getElementById("ai-summary");
  aiSummary.innerHTML = insights.map((insight) => `<li>${insight}</li>`).join("");
}


// Custom Categories


const languageSelect = document.getElementById("languageSelect");
const translations = {
  en: {
    summaryTitle: "AI Summary",
    tip: "Tip: Review your subscriptions to identify unnecessary expenses.",
    mostSpent: "You spend the most on",
    totalSpentHigh: "Your total spending this month is high.",
    totalSpentLow: "Your total spending this month is within a healthy range.",
  },
  hi: {
    summaryTitle: "AI सारांश",
    tip: "युक्ति: अनावश्यक खर्चों की पहचान करने के लिए अपनी सदस्यताओं की समीक्षा करें।",
    mostSpent: "आप सबसे ज्यादा खर्च करते हैं",
    totalSpentHigh: "इस माह आपका कुल खर्च अधिक है।",
    totalSpentLow: "इस महीने आपका कुल खर्च स्वस्थ सीमा के भीतर है।",
  },
  es: {
    summaryTitle: "Resumen de IA",
    tip: "Consejo: Revisa tus suscripciones para identificar gastos innecesarios.",
    mostSpent: "Gastas más en",
    totalSpentHigh: "Tus gastos totales este mes son altos.",
    totalSpentLow: "Tus gastos totales este mes están dentro de un rango saludable.",
  },
  fr: {
    summaryTitle: "Résumé de l'IA",
    tip: "Conseil : Révisez vos abonnements pour identifier les dépenses inutiles.",
    mostSpent: "Vous dépensez le plus sur",
    totalSpentHigh: "Vos dépenses totales ce mois-ci sont élevées.",
    totalSpentLow: "Vos dépenses totales ce mois-ci sont dans une fourchette saine.",
  },
  de: {
    summaryTitle: "KI-Zusammenfassung",
    tip: "Tipp: Überprüfen Sie Ihre Abonnements, um unnötige Ausgaben zu identifizieren.",
    mostSpent: "Sie geben am meisten aus für",
    totalSpentHigh: "Ihre Gesamtausgaben in diesem Monat sind hoch.",
    totalSpentLow: "Ihre Gesamtausgaben in diesem Monat liegen im gesunden Bereich.",
  },
};

languageSelect.addEventListener("change", () => {
  const selectedLanguage = languageSelect.value;

  // Update AI Summary
  const translation = translations[selectedLanguage];
  document.getElementById("ai-summary-title").textContent = translation.summaryTitle;

  generateAISummaryWithLanguage(translation);
});

function generateAISummaryWithLanguage(translation) {
  const insights = [];

  const categoryTotals = expenses.reduce((totals, expense) => {
    const convertedAmount = parseFloat(convertCurrency(expense.amount, currentCurrency));
    totals[expense.category] = (totals[expense.category] || 0) + convertedAmount;
    return totals;
  }, {});

  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (highestCategory) {
    insights.push(`${translation.mostSpent} "${highestCategory[0]}" with a total of ${currentCurrency} ${highestCategory[1].toFixed(2)}.`);
  }

  const totalSpent = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  if (totalSpent > 1000) {
    insights.push(`${translation.totalSpentHigh} (${currentCurrency} ${totalSpent.toFixed(2)}).`);
  } else {
    insights.push(`${translation.totalSpentLow} (${currentCurrency} ${totalSpent.toFixed(2)}).`);
  }

  insights.push(translation.tip);

  const aiSummary = document.getElementById("ai-summary");
  aiSummary.innerHTML = insights.map((insight) => `<li>${insight}</li>`).join("");
}

