import {
  VIETNAMESE_ALPHABET,
  bin2dec,
  binaryToDecimal,
  he10sang2,
  kiemTra2soNTCungNhau,
  sinhSoNguyenToNgauNhien,
} from "./helper.js";
import phanTuNghichDao from "./phanTuNghichDao.js";
import a_mu_b_mod_n from "./a_mu_b_mod_n.js";

class RSA {
  constructor() {
    this.VIETNAMESE_ALPHABET = VIETNAMESE_ALPHABET;
    this.p = sinhSoNguyenToNgauNhien();
    this.q = sinhSoNguyenToNgauNhien();
    this.n = this.p * this.q;
    this.phi = (this.p - 1) * (this.q - 1);
    this.e = sinhSoNguyenToNgauNhien(this.phi);
    while (!kiemTra2soNTCungNhau(this.e, this.phi))
      this.e = sinhSoNguyenToNgauNhien();
    this.d = phanTuNghichDao(this.e, this.phi);
  }

  static sinhKhoaRSA() {
    const rsa = new RSA();

    return {
      publicKey: { n: rsa.n, e: rsa.e },
      privateKey: { n: rsa.n, d: rsa.d },
    };
  }

  static maHoaRSA(plaintext, e, n, isBin = false) {
    if (typeof plaintext === "string") {
      plaintext = plaintext.trim().replaceAll(" ", "_");
      let c_text = "";
      for (let i = 0; i < plaintext.length; i++) {
        const index = VIETNAMESE_ALPHABET.indexOf(plaintext[i]);
        if (index === -1) {
          throw new Error("Tham số đầu vào chứa kí tự không hợp lệ");
        } else {
          c_text += a_mu_b_mod_n(index, e, n) + "-";
        }
      }
      return c_text;
    }

    if (isBin) {
      plaintext = bin2dec(plaintext);
      return he10sang2(a_mu_b_mod_n(plaintext, e, n));
    }

    return a_mu_b_mod_n(plaintext, e, n);
  }

  static giaiMaRSA(ciphertext, d, n, isBin = false) {
    if (typeof ciphertext === "string" && isBin === false) {
      let plaintext = "";
      ciphertext = ciphertext.trim().split("-");
      for (let i = 0; i < ciphertext.length - 1; i++) {
        let index = a_mu_b_mod_n(Number(ciphertext[i]), d, n);
        plaintext += VIETNAMESE_ALPHABET[index % VIETNAMESE_ALPHABET.length];

        // console.log("index :>> ", index);
      }
      return plaintext.replaceAll("_", " ");
    }

    if (isBin) {
      ciphertext = binaryToDecimal(ciphertext);
      return he10sang2(a_mu_b_mod_n(ciphertext, d, n));
    }

    return a_mu_b_mod_n(ciphertext, d, n);
  }
}

export default RSA;
