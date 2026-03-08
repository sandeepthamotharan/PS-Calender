import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUd70Bx34to5iI8PZVaJKQOlUIdFuei2U",
  authDomain: "ps-skill-calender.firebaseapp.com",
  projectId: "ps-skill-calender",
  storageBucket: "ps-skill-calender.firebasestorage.app",
  messagingSenderId: "700582112305",
  appId: "1:700582112305:web:b2e852417b7f1e70ab7910"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const allowedDomains = ["bitsathy.ac.in"];

const courses = [
  { name: "Algebra", levels: 3 },
  { name: "Aptitude", levels: 14 },
  { name: "Assembling and Dismantling - Gurugulam Assessment", levels: 1 },
  { name: "Autonomy Affairs - Regulations", levels: 1 },
  { name: "C Programming", levels: 7 },
  { name: "Calculus", levels: 1 },
  { name: "Communication", levels: 3 },
  { name: "Computer Networking", levels: 5 },
  { name: "Creative Media", levels: 1 },
  { name: "Data Structure - Core Concepts", levels: 1 },
  { name: "DBMS - Core Concept", levels: 1 },
  { name: "Differential Equation", levels: 1 },
  { name: "Electrical Wiring - Gurugulam Assessment", levels: 1 },
  { name: "Electronics - Gurugulam Assessment", levels: 1 },
  { name: "GP Challenge", levels: 1 },
  { name: "HTML/CSS", levels: 1 },
  { name: "IPR - Patent Search", levels: 1 },
  { name: "Java Script", levels: 1 },
  { name: "Leadership", levels: 4 },
  { name: "Leetcode", levels: 1 },
  { name: "Linux", levels: 4 },
  { name: "Logical Reasoning", levels: 2 },
  { name: "Physical Fitness", levels: 4 },
  { name: "Physical Fitness - Yoga", levels: 1 },
  { name: "PLC - Gurugulam Assessment", levels: 1 },
  { name: "Problem Solving Skills - Daily Challenge", levels: 1 },
  { name: "Problem Solving Skills - First Year", levels: 1 },
  { name: "Project Based Learning - Night Slots", levels: 1 },
  { name: "Prototype - Gurugulam Assessment", levels: 1 },
  { name: "PS Assessment - Brainstorming (2025-2029)", levels: 1 },
  { name: "React", levels: 1 },
  { name: "System Administration", levels: 4 },
  { name: "Version Control - Git,Github", levels: 1 },
  { name: "Welding - Gurugulam Assessment", levels: 1 }
];

const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const errorText = document.getElementById("errorText");
const userNameDisplay = document.getElementById("userNameDisplay");
const skillsGrid = document.getElementById("skillsGrid");
const totalCourses = document.getElementById("totalCourses");
const completedCourses = document.getElementById("completedCourses");

function isValidBitsathyEmail(email) {
  const parts = email.toLowerCase().trim().split("@");
  if (parts.length !== 2) return false;
  return allowedDomains.includes(parts[1]);
}

function showLogin(message = "") {
  loginPage.classList.remove("hidden");
  dashboard.classList.add("hidden");
  errorText.textContent = message;
}

function showDashboard(userName) {
  loginPage.classList.add("hidden");
  dashboard.classList.remove("hidden");
  userNameDisplay.textContent = userName;
}

function getCompletedCourseCount(progressData) {
  let count = 0;
  for (const course of courses) {
    count += progressData[course.name] || 0;
  }
  return count;
}

function updateOverview(progressData) {
  totalCourses.textContent = courses.length;
  completedCourses.textContent = getCompletedCourseCount(progressData);
}

/* Firestore document path:
   users/{uid}/psTracker/main
*/
function getProgressDocRef(uid) {
  return doc(db, "users", uid, "psTracker", "main");
}

async function loadProgress(uid) {
  const ref = getProgressDocRef(uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return data.progress || {};
  }

  return {};
}

async function saveProgress(uid, progressData) {
  const ref = getProgressDocRef(uid);
  await setDoc(
    ref,
    {
      progress: progressData,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

function createCourseCard(course, user, progressData, onUpdate) {
  const card = document.createElement("div");
  card.className = "skill-card";

  const title = document.createElement("h3");
  title.className = "skill-title";
  title.textContent = course.name;

  const meta = document.createElement("div");
  meta.className = "skill-meta";
  meta.innerHTML = `
    <span class="meta-icon">◧</span>
    <span>Levels: ${course.levels}</span>
  `;

  const segmentTrack = document.createElement("div");
  segmentTrack.className = "segment-track";

  const progressText = document.createElement("p");
  progressText.className = "progress-text";

  const buttonWrap = document.createElement("div");
  buttonWrap.className = "card-buttons";

  const nextBtn = document.createElement("button");
  nextBtn.className = "course-btn";
  nextBtn.textContent = "Completed";

  const resetBtn = document.createElement("button");
  resetBtn.className = "reset-btn";
  resetBtn.textContent = "Reset";

  const segments = [];

  for (let i = 0; i < course.levels; i++) {
    const seg = document.createElement("span");
    seg.className = "segment";
    segmentTrack.appendChild(seg);
    segments.push(seg);
  }

  function updateCard() {
    const completedLevels = progressData[course.name] || 0;

    segments.forEach((segment, index) => {
      if (index < completedLevels) {
        segment.classList.add("active");
      } else {
        segment.classList.remove("active");
      }
    });

    const percent = Math.round((completedLevels / course.levels) * 100);
    progressText.textContent = `Progress: ${completedLevels}/${course.levels} levels (${percent}%)`;

    if (completedLevels >= course.levels) {
      card.classList.add("completed");
      nextBtn.textContent = "Completed";
      nextBtn.classList.add("completed-btn");
      nextBtn.disabled = true;
    } else {
      card.classList.remove("completed");
      nextBtn.textContent = "Completed";
      nextBtn.classList.remove("completed-btn");
      nextBtn.disabled = false;
    }
  }

  nextBtn.addEventListener("click", async () => {
    const current = progressData[course.name] || 0;
    if (current < course.levels) {
      progressData[course.name] = current + 1;
      await saveProgress(user.uid, progressData);
      updateCard();
      onUpdate();
    }
  });

  resetBtn.addEventListener("click", async () => {
    progressData[course.name] = 0;
    await saveProgress(user.uid, progressData);
    updateCard();
    onUpdate();
  });

  updateCard();

  buttonWrap.appendChild(nextBtn);
  buttonWrap.appendChild(resetBtn);

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(segmentTrack);
  card.appendChild(progressText);
  card.appendChild(buttonWrap);

  return card;
}

async function renderCourses(user) {
  const progressData = await loadProgress(user.uid);

  skillsGrid.innerHTML = "";

  for (const course of courses) {
    const card = createCourseCard(course, user, progressData, () => {
      updateOverview(progressData);
    });
    skillsGrid.appendChild(card);
  }

  updateOverview(progressData);
}

googleLoginBtn.addEventListener("click", async () => {
  errorText.textContent = "";

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log("Logged in email:",user.email);

    if (!user.email || !isValidBitsathyEmail(user.email)) {
      await signOut(auth);
      showLogin("Only BITSathy Google mail ID is accepted.");
      return;
    }

   console.log("Login success");
   await renderCourses(user);
   console.log("Rendering dashboard");
   showDashboard(user.displayName || user.email);
  } catch (error) {
    showLogin(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showLogin("");
  } catch (error) {
    alert(error.message);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (!user.email || !isValidBitsathyEmail(user.email)) {
      await signOut(auth);
      showLogin("Only BITSathy Google mail ID is accepted.");
      return;
    }

    await renderCourses(user);
    showDashboard(user.displayName || user.email);
  } else {
    showLogin("");
  }
});