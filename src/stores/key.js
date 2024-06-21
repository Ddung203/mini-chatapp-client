import { defineStore } from "pinia";
import { ref } from "vue";
import bcrypt from "bcryptjs";
import HTTP from "../api/axiosInstance";
import { sinhKhoaRSA } from "../encode/rsa/rsa";

const useKeyStore = defineStore("key", {
  state: () => ({
    receiverPublicKey: ref(null),
    publicKeyJwk: ref(null),
    privateKeyJwk: ref(null),
    onlineUsers: ref([]),
    messages: ref([]),
  }),
  getters: {
    getPublicKeyJwk: (state) => state.publicKeyJwk,
    getPrivateKeyJwk: (state) => state.privateKeyJwk,
  },
  actions: {
    clear() {
      this.$reset();
      localStorage.clear();
    },

    async setReceiverPublicKey(username) {
      const response = await HTTP.get(
        `/auth/receiver-publicKey?receiver=${username}`
      );
      this.receiverPublicKey = JSON.parse(response);
    },

    async exportPrivateKey(fileName) {
      try {
        const privateKeyStr = JSON.stringify(this.privateKeyJwk);

        // Create a new file handle using the File System Access API
        const options = {
          types: [
            {
              description: "JSON Files",
              accept: {
                "application/json": [".json"],
              },
            },
          ],
        };
        const handle = await window.showSaveFilePicker({
          suggestedName: `${fileName}-privateKey.json`,
          ...options,
        });

        const writableStream = await handle.createWritable();

        await writableStream.write(privateKeyStr);

        await writableStream.close();

        console.log("Private key successfully exported!");
      } catch (error) {
        console.error("An error occurred during export:", error);
      }
    },

    async importPrivateKey() {
      try {
        // Mở hộp thoại để người dùng chọn file
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: "JSON Files",
              accept: {
                "application/json": [".json"],
              },
            },
          ],
          multiple: false,
        });

        // Lấy nội dung file
        const file = await fileHandle.getFile();
        const fileContent = await file.text();
        this.privateKeyJwk = JSON.parse(fileContent);

        // Lưu private key vào localStorage
        localStorage.setItem("privateKey", JSON.stringify(this.privateKeyJwk));

        console.log("Private key successfully imported!");
      } catch (error) {
        console.error("An error occurred during import:", error);
      }
    },

    async createKeyPair() {
      const { publicKey, privateKey } = sinhKhoaRSA();
      this.publicKeyJwk = publicKey;
      this.privateKeyJwk = privateKey;
    },

    async sendPublicKeyToServer(username) {
      try {
        const salt = bcrypt.genSaltSync(10);
        const privateKeyHash = bcrypt.hashSync(
          JSON.stringify(this.privateKeyJwk),
          salt
        );

        const response = await HTTP.post("/auth/save-publicKey", {
          username,
          publicKey: JSON.stringify(this.publicKeyJwk),
          privateKeyHash,
        });
      } catch (error) {
        console.log(error);
        return;
      }
    },

    setKeyPair(publicKey, privateKey) {
      this.publicKeyJwk = publicKey;
      this.privateKeyJwk = privateKey;
    },
  },
});

export default useKeyStore;
