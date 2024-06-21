import {
  VIETNAMESE_ALPHABET,
  kiemTra2soNTCungNhau,
  sinhSoNguyenToNgauNhien,
} from "./helper.js";
import phanTuNghichDao from "./phanTuNghichDao.js";
import a_mu_b_mod_n from "./a_mu_b_mod_n.js";

const sinhKhoaRSA = () => {
  const p = sinhSoNguyenToNgauNhien();
  const q = sinhSoNguyenToNgauNhien();
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = sinhSoNguyenToNgauNhien(phi);

  while (!kiemTra2soNTCungNhau(e, phi)) {
    e = sinhSoNguyenToNgauNhien();
  }

  const d = phanTuNghichDao(e, phi);

  return {
    publicKey: { n, e },
    privateKey: { n, d },
  };
};

const maHoaRSA = ({ plaintext, publicKey }) => {
  try {
    if (
      typeof plaintext !== "string" ||
      !publicKey ||
      typeof publicKey.e !== "number" ||
      typeof publicKey.n !== "number"
    ) {
      console.log(`${typeof publicKey.e} - ${typeof publicKey.n}`);
      throw new Error("Tham số đầu vào không hợp lệ");
    }

    let c_text = "";
    plaintext = plaintext.trim().replaceAll(" ", "_");

    for (let i = 0; i < plaintext.length; i++) {
      const index = VIETNAMESE_ALPHABET.indexOf(plaintext[i]);
      if (index === -1) {
        throw new Error(`Kí tự không hợp lệ: ${plaintext[i]}`);
      }
      const encryptedChar = a_mu_b_mod_n(index + 220, publicKey.e, publicKey.n);
      c_text += encryptedChar + "-";
    }

    c_text = c_text.slice(0, -1);
    return c_text;
  } catch (error) {
    console.error("Lỗi mã hóa RSA:", error);
    return "123";
  }
};

const giaiMaRSA = ({ ciphertext, privateKey }) => {
  try {
    if (
      !privateKey ||
      typeof privateKey.d !== "number" ||
      typeof privateKey.n !== "number"
    ) {
      throw new Error("Khóa bí mật không hợp lệ");
    }

    let plaintext = "";
    ciphertext = ciphertext.split("-");

    console.log("ciphertext :>> ", ciphertext);

    for (let i = 0; i < ciphertext.length; i++) {
      if (ciphertext[i] === "") continue;

      console.log("ciphertext[i] :>> ", ciphertext[i]);
      console.log("privateKey.d :>> ", privateKey.d);
      console.log("privateKey.n :>> ", privateKey.n);

      let index =
        a_mu_b_mod_n(Number(ciphertext[i]), privateKey.d, privateKey.n) - 220;

      console.log("index :>> ", index);
      if (index < 0) {
        continue;
      }
      if (index >= VIETNAMESE_ALPHABET.length)
        index = index % VIETNAMESE_ALPHABET.length;
      plaintext += VIETNAMESE_ALPHABET[index];
    }

    return plaintext.replaceAll("_", " ");
  } catch (error) {
    console.error("Lỗi giải mã RSA:", error);
    return null;
  }
};

//! Test
// const { publicKey, privateKey } = sinhKhoaRSA();

const publicKey = { n: 9192791, e: 6637 };
const privateKey = { d: 2907589, n: 9192791 };

// console.log(" { publicKey, privateKey } :>> ", { publicKey, privateKey });

const plaintext = "A";
const ciphertext = maHoaRSA({ plaintext, publicKey });
const decryptedText = giaiMaRSA({ ciphertext: "41929576", privateKey });

console.log("Plaintext:", plaintext);
console.log("Ciphertext:", ciphertext);
console.log("Decrypted Text:", decryptedText);
