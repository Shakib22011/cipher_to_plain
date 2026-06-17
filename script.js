
// =========================
// GLOBAL
// =========================

let currentCipher = "mono";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let playfairMatrix = [];
let playfairKey = "";

let hillMatrix = [];
let hillSize = 2;

// =========================
// LOAD CIPHERS
// =========================
function loadCipher(type) {
    currentCipher = type;
    clearAll();
    updateCipherButtons(type);

    if (type === "mono") loadMonoTutorial();
    if (type === "playfair") loadPlayfairTutorial();
    if (type === "hill") loadHillTutorial();
}

function updateCipherButtons(type) {
    document.querySelectorAll(".cipher-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.cipher === type);
    });
}

// =========================
// REMOVE DUPLICATES FROM KEYWORD
// =========================
function cleanKeyword(key) {
    let result = "";
    key = key.toUpperCase();

    for (let ch of key) {
        if (!result.includes(ch) && alphabet.includes(ch)) {
            result += ch;
        }
    }
    return result;
}

// =========================
// BUILD CIPHER ALPHABET (IMPORTANT FIX)
// =========================
function buildCipherAlphabet(keyword) {

    keyword = cleanKeyword(keyword);

    let result = keyword;

    for (let ch of alphabet) {
        if (!result.includes(ch)) {
            result += ch;
        }
    }

    return result;
}

// =========================
// RANDOM KEY (OPTIONAL)
// =========================
function generateRandomKey() {
    let arr = alphabet.split("");

    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    document.getElementById("keyArea").innerHTML = `
        <label>Key (26 letters)</label>
        <input id="keyInput" value="${arr.join("")}">
    `;
}

// =========================
// GET KEY
// =========================
function getKey() {
    let keyInput = document.getElementById("keyInput");

    if (!keyInput || keyInput.value.trim() === "") {
        return "JO";
    }

    return keyInput.value.trim().toUpperCase();
}

// =========================
// MONO ENCRYPT (FIXED)
// =========================
function encryptMessage() {

    let text = document.getElementById("plainText").value.toUpperCase();
    let keyword = getKey();

    let cipherAlpha = buildCipherAlphabet(keyword);

    let map = {};
    for (let i = 0; i < 26; i++) {
        map[alphabet[i]] = cipherAlpha[i];
    }

    let result = "";
    let steps = "";

    for (let ch of text) {

        if (map[ch]) {
            result += map[ch];
            steps += `${ch} → ${map[ch]}<br>`;
        }
        else {
            result += ch;
        }
    }

    document.getElementById("encryptedOutput").value = result;

    document.getElementById("stepsBox").innerHTML = `
        <b>Keyword:</b> ${keyword}<br><br>
        <b>Cipher Alphabet:</b> ${cipherAlpha}<br><br>
        ${steps}
    `;

    showMapping(cipherAlpha);
}

// =========================
// MONO DECRYPT
// =========================
function decryptMessage() {

    let text = document.getElementById("cipherText").value.toUpperCase();
    let keyword = getKey();

    if (currentCipher === "mono") {

        let cipherAlpha = buildCipherAlphabet(keyword);

        let map = {};
        for (let i = 0; i < 26; i++) {
            map[cipherAlpha[i]] = alphabet[i];
        }

        let result = "";
        let steps = "";

        for (let ch of text) {

            if (map[ch]) {
                result += map[ch];
                steps += `${ch} → ${map[ch]}<br>`;
            }
            else {
                result += ch;
            }
        }

        document.getElementById("decryptedOutput").value = result;

        document.getElementById("decryptSteps").innerHTML = `
            <b>Keyword:</b> ${keyword}<br><br>
            <b>Cipher Alphabet:</b> ${cipherAlpha}<br><br>
            ${steps}
        `;
    }

    else if (currentCipher === "playfair") {
        playfairKey = keyword;
        buildPlayfairMatrix(keyword);
        decryptPlayfair(text);
    }

    else if (currentCipher === "hill") {
        parseHillKey(keyword);
        decryptHill(text);
    }
}

// =========================
// COPY
// =========================
function copyEncrypted() {
    navigator.clipboard.writeText(
        document.getElementById("encryptedOutput").value
    );
}

function copyDecrypted() {
    navigator.clipboard.writeText(
        document.getElementById("decryptedOutput").value
    );
}

// =========================
// CLEAR
// =========================
function clearAll() {
    document.getElementById("plainText").value = "";
    document.getElementById("cipherText").value = "";
    document.getElementById("encryptedOutput").value = "";
    document.getElementById("decryptedOutput").value = "";
    document.getElementById("stepsBox").innerHTML = "";
    document.getElementById("decryptSteps").innerHTML = "";
    document.getElementById("visualization").innerHTML = "";
}

// =========================
// VISUALIZATION (FIXED)
// =========================
function showMapping(cipherAlpha) {

    let html = `<div class="mapping-grid">`;

    for (let i = 0; i < 26; i++) {
        html += `
        <div class="mapping-cell">
            ${alphabet[i]} → ${cipherAlpha[i]}
        </div>`;
    }

    html += `</div>`;

    document.getElementById("visualization").innerHTML = html;
}

// =========================
// MONO TUTORIAL (UPDATED)
// =========================
function loadMonoTutorial() {

    document.getElementById("tutorialContainer").innerHTML = `
        <div class="accordion">

            <button class="accordion-btn">What is Cipher?</button>
            <div class="accordion-content">
                Cipher is a method used to convert plaintext into unreadable ciphertext to protect information.
            </div>

            <button class="accordion-btn">What is Monoalphabetic Cipher?</button>
            <div class="accordion-content">
                A substitution cipher where each letter is replaced by a fixed letter. 
                <br><br>
                Example: A → J, B → O, C → A...
            </div>

            <button class="accordion-btn">Working Procedure</button>
            <div class="accordion-content">
                1. Take keyword (e.g. IMRAN or JO)<br>
                2. Remove duplicate letters<br>
                3. Append remaining A-Z letters<br>
                4. Create substitution mapping<br>
                5. Encrypt / Decrypt using mapping
            </div>

            <button class="accordion-btn">Cryptanalysis</button>
            <div class="accordion-content">
                It can be broken using frequency analysis by checking repeated letters like E, T, A, O and comparing patterns.
            </div>

            <button class="accordion-btn">Advantages & Disadvantages</button>
            <div class="accordion-content">
                ✔ Simple<br>
                ✔ Easy to implement<br>
                ✘ Weak against frequency analysis<br>
                ✘ Not secure for real systems
            </div>

        </div>
    `;

    activateAccordion();
}

// =========================
// PLAYFAIR (BASIC)
// =========================
function buildPlayfairMatrix(key) {

    key = key.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");

    let used = "";
    let matrixString = "";

    for (let ch of key + alphabet) {
        if (ch === "J") continue;
        if (!used.includes(ch)) {
            used += ch;
        }
    }

    // convert to 5x5 matrix
    playfairMatrix = [];
    let index = 0;

    for (let i = 0; i < 5; i++) {
        let row = [];
        for (let j = 0; j < 5; j++) {
            row.push(used[index++]);
        }
        playfairMatrix.push(row);
    }

    return used;
}

function showPlayfairMatrix() {

    let html = `<div class="key-square">`;

    for (let row of playfairMatrix) {
        for (let ch of row) {
            html += `<div>${ch}</div>`;
        }
    }

    html += `</div>`;

    document.getElementById("visualization").innerHTML = html;
}

function preparePlayfairText(text) {

    text = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
    let result = "";

    for (let i = 0; i < text.length; i++) {
        let a = text[i];
        let b = text[i + 1];

        if (a === b) {
            result += a + "X";
        } else {
            result += a + (b || "");
            i++;
        }
    }

    if (result.length % 2 !== 0) result += "X";

    return result;
}

function findPosition(ch) {

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (playfairMatrix[i][j] === ch) {
                return [i, j];
            }
        }
    }
}

function encryptPlayfair(text) {

    let pairs = preparePlayfairText(text);
    if (!pairs) {
        document.getElementById("encryptedOutput").value = "";
        document.getElementById("stepsBox").innerHTML = "Enter letters A-Z to encrypt with Playfair.";
        document.getElementById("visualization").innerHTML = "";
        return;
    }
    let result = "";
    let steps = "";

    for (let i = 0; i < pairs.length; i += 2) {

        let a = pairs[i];
        let b = pairs[i + 1];

        let [r1, c1] = findPosition(a);
        let [r2, c2] = findPosition(b);

        if (r1 === r2) {
            result += playfairMatrix[r1][(c1 + 1) % 5];
            result += playfairMatrix[r2][(c2 + 1) % 5];
        }
        else if (c1 === c2) {
            result += playfairMatrix[(r1 + 1) % 5][c1];
            result += playfairMatrix[(r2 + 1) % 5][c2];
        }
        else {
            result += playfairMatrix[r1][c2];
            result += playfairMatrix[r2][c1];
        }

        steps += `${a}${b} → ${result.slice(-2)}<br>`;
    }

    document.getElementById("encryptedOutput").value = result;
    document.getElementById("stepsBox").innerHTML = steps;

    showPlayfairMatrix();
}

function decryptPlayfair(text) {

    text = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");

    if (!text) {
        document.getElementById("decryptedOutput").value = "";
        document.getElementById("decryptSteps").innerHTML = "Enter letters A-Z to decrypt with Playfair.";
        document.getElementById("visualization").innerHTML = "";
        return;
    }

    let result = "";
    let steps = "";

    for (let i = 0; i < text.length; i += 2) {

        let a = text[i];
        let b = text[i + 1];

        let [r1, c1] = findPosition(a);
        let [r2, c2] = findPosition(b);

        if (r1 === r2) {
            result += playfairMatrix[r1][(c1 + 4) % 5];
            result += playfairMatrix[r2][(c2 + 4) % 5];
        }
        else if (c1 === c2) {
            result += playfairMatrix[(r1 + 4) % 5][c1];
            result += playfairMatrix[(r2 + 4) % 5][c2];
        }
        else {
            result += playfairMatrix[r1][c2];
            result += playfairMatrix[r2][c1];
        }

        steps += `${a}${b} → ${result.slice(-2)}<br>`;
    }

    document.getElementById("decryptedOutput").value = result;
    document.getElementById("decryptSteps").innerHTML = steps;

    showPlayfairMatrix();
}

function loadPlayfairTutorial() {

    document.getElementById("tutorialContainer").innerHTML = `
        <div class="accordion">

            <button class="accordion-btn">Playfair Cipher</button>
            <div class="accordion-content">
                Uses 5x5 matrix based on keyword (I/J combined).
            </div>

            <button class="accordion-btn">Working Procedure</button>
            <div class="accordion-content">
                1. Create 5x5 matrix using keyword<br>
                2. Split text into pairs<br>
                3. Apply Playfair rules<br>
                4. Encrypt/Decrypt
            </div>

            <button class="accordion-btn">Rules</button>
            <div class="accordion-content">
                Same row → shift right<br>
                Same column → shift down<br>
                Rectangle → swap corners
            </div>

        </div>
    `;

    activateAccordion();

    document.getElementById("keyArea").innerHTML = `
        <label>Keyword</label>
        <input id="keyInput" placeholder="Enter keyword">
    `;
}

function encryptMessage() {

    let text = document.getElementById("plainText").value.toUpperCase();
    let keyword = getKey();

    if (currentCipher === "mono") {

        let cipherAlpha = buildCipherAlphabet(keyword);

        let map = {};
        for (let i = 0; i < 26; i++) {
            map[alphabet[i]] = cipherAlpha[i];
        }

        let result = "";
        let steps = "";

        for (let ch of text) {
            result += map[ch] || ch;
            steps += map[ch] ? `${ch} → ${map[ch]}<br>` : "";
        }

        document.getElementById("encryptedOutput").value = result;
        document.getElementById("stepsBox").innerHTML = steps;

        showMapping(cipherAlpha);
    }

    else if (currentCipher === "playfair") {

        playfairKey = keyword;
        buildPlayfairMatrix(keyword);
        encryptPlayfair(text);
    }

    else if (currentCipher === "hill") {

        parseHillKey(keyword);
        encryptHill(text);
    }
}

// =========================
// HILL (BASIC)
// =========================
function parseHillKey(key) {

    let nums = (key.match(/-?\d+/g) || []).map(Number);

    if (nums.length !== 4) {
        nums = [3, 3, 2, 5]; // default matrix
    }

    hillMatrix = [
        [nums[0], nums[1]],
        [nums[2], nums[3]]
    ];

    return hillMatrix;
}

function hillDeterminant(matrix) {

    return ((matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0])) % 26;
}

function hillMod(value) {

    return ((value % 26) + 26) % 26;
}

function hillIsValid(matrix) {

    let det = hillMod(hillDeterminant(matrix));

    for (let i = 1; i < 26; i++) {
        if ((det * i) % 26 === 1) {
            return true;
        }
    }

    return false;
}

function prepareHillText(text) {

    text = text.toUpperCase().replace(/[^A-Z]/g, "");

    if (text.length % 2 !== 0) {
        text += "X";
    }

    return text;
}

function multiplyMatrix(pair) {

    let x = alphabet.indexOf(pair[0]);
    let y = alphabet.indexOf(pair[1]);

    let c1 = (hillMatrix[0][0] * x + hillMatrix[0][1] * y) % 26;
    let c2 = (hillMatrix[1][0] * x + hillMatrix[1][1] * y) % 26;

    return alphabet[c1] + alphabet[c2];
}

function encryptHill(text) {

    if (!hillIsValid(hillMatrix)) {
        document.getElementById("encryptedOutput").value = "";
        document.getElementById("stepsBox").innerHTML = "Invalid Hill key matrix. Use a 2×2 matrix with determinant coprime to 26.";
        document.getElementById("visualization").innerHTML = "";
        return;
    }

    text = prepareHillText(text);

    let result = "";
    let steps = "";

    for (let i = 0; i < text.length; i += 2) {

        let pair = text[i] + text[i + 1];
        let enc = multiplyMatrix(pair);

        result += enc;
        steps += `${pair} → ${enc}<br>`;
    }

    document.getElementById("encryptedOutput").value = result;
    document.getElementById("stepsBox").innerHTML = steps;

    showHillMatrix();
}

function showHillMatrix() {

    let html = `
    <div class="matrix">
        <div>${hillMatrix[0][0]}</div>
        <div>${hillMatrix[0][1]}</div>
        <div>${hillMatrix[1][0]}</div>
        <div>${hillMatrix[1][1]}</div>
    </div>`;

    document.getElementById("visualization").innerHTML = html;
}

function modInverse(a, m) {

    for (let i = 1; i < m; i++) {
        if ((a * i) % m === 1) return i;
    }

    return null;
}

function decryptHill(text) {

    if (!hillIsValid(hillMatrix)) {
        document.getElementById("decryptedOutput").value = "";
        document.getElementById("decryptSteps").innerHTML = "Invalid Hill key matrix. Use a 2×2 matrix with determinant coprime to 26.";
        return;
    }

    let a = hillMatrix[0][0];
    let b = hillMatrix[0][1];
    let c = hillMatrix[1][0];
    let d = hillMatrix[1][1];

    let det = (a * d - b * c) % 26;
    if (det < 0) det += 26;

    let invDet = modInverse(det, 26);

    if (invDet === null) {
        document.getElementById("decryptedOutput").value = "";
        document.getElementById("decryptSteps").innerHTML = "Cannot decrypt: key matrix has no inverse modulo 26.";
        return;
    }

    let invMatrix = [
        [(d * invDet) % 26, (-b * invDet) % 26],
        [(-c * invDet) % 26, (a * invDet) % 26]
    ];

    let result = "";
    let steps = "";

    for (let i = 0; i < text.length; i += 2) {

        let x = alphabet.indexOf(text[i]);
        let y = alphabet.indexOf(text[i + 1]);

        let p1 = (invMatrix[0][0] * x + invMatrix[0][1] * y) % 26;
        let p2 = (invMatrix[1][0] * x + invMatrix[1][1] * y) % 26;

        if (p1 < 0) p1 += 26;
        if (p2 < 0) p2 += 26;

        let pair = alphabet[p1] + alphabet[p2];
        result += pair;

        steps += `${text[i]}${text[i + 1]} → ${pair}<br>`;
    }

    document.getElementById("decryptedOutput").value = result;
    document.getElementById("decryptSteps").innerHTML = steps;
}

function loadHillTutorial() {

    document.getElementById("tutorialContainer").innerHTML = `
        <div class="accordion">

            <button class="accordion-btn">What is Hill Cipher?</button>
            <div class="accordion-content">
                Hill Cipher is a polygraphic cipher that uses matrix multiplication to encrypt text.
            </div>

            <button class="accordion-btn">Working Principle</button>
            <div class="accordion-content">
                1. Convert letters to numbers (A=0 to Z=25)<br>
                2. Use 2×2 matrix key<br>
                3. Multiply matrix with plaintext vector<br>
                4. Apply mod 26
            </div>

            <button class="accordion-btn">Encryption Rule</button>
            <div class="accordion-content">
                C = (K × P) mod 26<br>
                Where K = key matrix, P = plaintext vector
            </div>

            <button class="accordion-btn">Decryption Rule</button>
            <div class="accordion-content">
                P = K⁻¹ × C mod 26<br>
                Requires inverse matrix calculation
            </div>

            <button class="accordion-btn">Cryptanalysis</button>
            <div class="accordion-content">
                Hill Cipher is vulnerable if attacker gets enough plaintext-ciphertext pairs.
            </div>

            <button class="accordion-btn">Advantages & Disadvantages</button>
            <div class="accordion-content">
                ✔ Stronger than substitution cipher<br>
                ✔ Uses mathematical structure<br><br>

                ✘ Weak key choices break system<br>
                ✘ Requires invertible matrix
            </div>

        </div>
    `;

    activateAccordion();

    document.getElementById("keyArea").innerHTML = `
        <label>2×2 Key Matrix (a b c d)</label>
        <input id="keyInput" placeholder="e.g. 3 3 2 5">
    `;
}


// =========================
// ACCORDION
// =========================
function activateAccordion() {
    document.querySelectorAll(".accordion-btn").forEach(btn => {
        btn.onclick = function () {
            let content = this.nextElementSibling;
            content.style.display =
                content.style.display === "block" ? "none" : "block";
        };
    });
}

// =========================
// INIT
// =========================
loadCipher("mono");