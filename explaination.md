# Shopster — API Config Samjhaiye (Explanation)

Ye document un doubts ke liye hai jo class mein aaye: **"sir aapne axios ka code change kiya hai, `import.meta.env.VITE_API_URL` kya hai, `vite.config.js` mein kya hora hai?"**

Hum ise phases mein todenge taaki step-by-step samajh aaye.

---

## Phase 1: Problem kya thi? (Before)

Pehle hum code mein directly likhte the:

```js
fetch("http://localhost:3000/api/product")
```

Ye **hardcoded** URL hai. Ye tab tak sahi chalta hai jab tak:
- Aap sirf apne local machine (`localhost`) pe kaam kar rahe ho
- Backend hamesha port `3000` pe hi chal raha ho

**Problem:** Jaise hi ye project deploy hoga (Vercel/Render/Netlify pe), backend ka URL kuch is tarah ka hoga:
`https://shopster-backend.onrender.com/api`

Agar URL hardcoded hai, to deploy karte time har jagah URL change karna padega — bahut error-prone hai. Isliye ek "switch" chahiye jo local aur production ke hisaab se URL khud badal de. Ye switch hi **environment variable** kehlata hai.

---

## Phase 2: `import.meta.env` kya hai?

Ye line dekho (`frontend-shopster/src/api/axios.js`):

```js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
```

Ise todke samjhte hain:

| Part | Matlab |
|---|---|
| `import.meta` | Ye ek built-in JS object hai jo module ke baare mein info deta hai. Vite isi ke andar apna `env` object daal deta hai. |
| `import.meta.env` | Vite ka special object jisme saare environment variables store hote hain. |
| `import.meta.env.VITE_API_URL` | Aapke `.env` file mein defined ek custom variable. |
| `|| "http://localhost:3000/api"` | Agar `VITE_API_URL` set nahi hai (jaise abhi humare local project mein hai), to ye default fallback use hoga. |

**Zaroori Rule (Vite-specific):** Vite mein sirf wahi environment variables frontend code mein use ho sakte hain jinke naam ke aage `VITE_` prefix ho. Ye Vite ka security rule hai — taaki galti se koi secret key (jaise database password) accidentally frontend/browser mein expose na ho jaaye.

Isliye variable ka naam `VITE_API_URL` hai, sirf `API_URL` nahi.

### Kaise set karte hain?

`frontend-shopster` folder ke root mein ek `.env` file banate hain:

```
VITE_API_URL=http://localhost:3000/api
```

Production mein (jab deploy karoge), wahi variable Vercel/Netlify ke dashboard mein set kar doge:

```
VITE_API_URL=https://shopster-backend.onrender.com/api
```

Code ek line bhi change nahi hogi — bas environment variable badal jayega. **Yehi is pattern ka fayda hai.**

> Abhi humare project mein `.env` file nahi bani hai, isliye `VITE_API_URL` hamesha `undefined` hai, aur fallback (`http://localhost:3000/api`) hi use ho raha hai. Isiliye local pe sab kuch normal chal raha hai.

---

## Phase 3: `axios.js` file poori tarah samjho

File: `frontend-shopster/src/api/axios.js`

```js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const API = async (path, options = {}) => {
  const tokenType = options.tokenType;
  delete options.tokenType;

  let token;
  if (tokenType === "admin") {
    token = localStorage.getItem("token");
  } else if (tokenType === "buyer") {
    token = localStorage.getItem("buyerToken");
  } else {
    token = localStorage.getItem("buyerToken") || localStorage.getItem("token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export default API;
```

**Note:** File ka naam `axios.js` hai, lekin andar hum `axios` library use nahi kar rahe — hum browser ka built-in `fetch()` use kar rahe hain. Naam sirf isliye rakha gaya taaki convention se samajh aa jaye ki "ye file API calls handle karti hai". Isse confuse mat hona.

Line-by-line:

1. `API_BASE_URL` — jaisa Phase 2 mein samjhaya, ye base URL hai (e.g. `http://localhost:3000/api`).
2. `API = async (path, options = {}) => {...}` — Ye ek **reusable helper function** hai jo har API call ke liye use hoga, taaki har jagah `fetch` ka boilerplate na likhna pade.
3. `tokenType` — Bataata hai ki request **admin** account ke liye hai ya **buyer** account ke liye, kyunki dono ke tokens alag-alag jagah save hote hain.
4. `token` nikaalna — `localStorage` se sahi token uthaya jata hai based on `tokenType`.
5. `headers` — Har request ke saath `Content-Type: application/json` jaata hai, aur agar token mile to `Authorization: Bearer <token>` bhi add hota hai (login-protected routes ke liye zaroori).
6. `fetch(`${API_BASE_URL}${path}`, ...)` — Yahi asli network call hai. `path` jaise `/product` diya jata hai, to final URL banta hai: `http://localhost:3000/api/product`.
7. `response.json().catch(() => ({}))` — Response ko JSON mein convert karta hai; agar body khaali ho to crash na ho, isliye empty object `{}` fallback.
8. `if (!response.ok) throw ...` — Agar server ne error status (400/401/500 etc.) bheja, to error throw karta hai jise calling component `try/catch` mein pakad sakta hai.
9. `export default API` — Ise import karke poore app mein use karte hain, jaise:

```js
import API from "../api/axios";

const products = await API("/product");
```

**Fayda:** Agar kabhi URL, headers, ya auth logic change karna ho, to sirf **is ek file** mein change karna padega — har component mein nahi.

---

## Phase 4: `vite.config.js` kya hai?

File: `frontend-shopster/vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

**Ye kya hai?** Jab humne `npm create vite@latest` se React project banaya tha, tab Vite ne khud ye file auto-generate ki thi. Ye humne "change" nahi kiya — ye pehle se hi tha, bas kabhi dhyan se dekha nahi gaya hoga.

- `defineConfig({...})` — Vite ko bolta hai "yeh meri build/dev server settings hain". `defineConfig` sirf editor mein autocomplete/type-hints dene ke liye hai — practically kaam ek plain object jaisa hi karta hai.
- `plugins: [react()]` — Vite ko batata hai ki is project mein React support chahiye (JSX samajhna, Fast Refresh/hot-reload karna, etc.)

**Important:** Is file ka `import.meta.env.VITE_API_URL` se koi direct link nahi hai. `vite.config.js` sirf build tool ki settings hai (server, plugins, proxy, etc.). Environment variables `.env` file se aate hain, aur Vite automatically unhe `import.meta.env` mein inject kar deta hai — iske liye `vite.config.js` mein kuch likhna zaroori nahi hai (jab tak aap advanced cheeze jaise custom `envDir` na set karna chaho).

---

## Phase 5: Frontend ↔ Backend connection ka poora flow

```
[Browser / React App]                [Backend / Express Server]
   axios.js                              server.js
   API_BASE_URL = "http://localhost:3000/api"
        |                                    |
        |  fetch("http://localhost:3000/api/product")
        |----------------------------------->|
        |                                    |  PORT = process.env.PORT || 3000
        |                                    |  app.listen(PORT)
        |                                    |  route: app.use("/api/product", productRoutes)
        |<-----------------------------------|
        |          JSON response             |
```

Backend (`backend-shopster/server.js`) mein dekho:

```js
const PORT = process.env.PORT || 3000;
...
app.use("/api/product", productRoutes);
```

Yahi wajah hai ki frontend ka fallback URL `http://localhost:3000/api` hai — kyunki backend bhi default `3000` pe hi chalta hai, aur routes `/api/...` se start hote hain.

**Doubt clear:** Agar aap backend ka PORT `.env` mein change karo (jaise `PORT=5000`), to frontend ka `VITE_API_URL` bhi `.env` mein update karna hoga (`http://localhost:5000/api`), warna frontend purane port pe hi request bhejta rahega aur "Failed to fetch" jaisa error aayega.

---

## Phase 6: Deploy karte waqt kya badlega?

| Cheez | Local Dev | Production (Deploy ke baad) |
|---|---|---|
| Frontend `.env` | `VITE_API_URL=http://localhost:3000/api` | `VITE_API_URL=https://your-backend.onrender.com/api` (Vercel/Netlify dashboard mein set) |
| Backend `.env` | `PORT=3000` | Hosting provider khud PORT assign karta hai |
| Code changes | Zero | Zero |

Yahi is puri setup ka core idea hai: **code same rehta hai, sirf environment variable badalta hai.**

---

## Phase 7: Common Doubts (FAQ)

**Q1: File ka naam `axios.js` hai, lekin `axios` library kahin dikh nahi rahi?**
Haan sahi observation hai — ye file `fetch()` use karti hai, `axios` package nahi. Naam sirf convention ke liye hai.

**Q2: `import.meta.env` error de raha hai / undefined aa raha hai?**
Ye sirf Vite projects mein kaam karta hai (Create-React-App mein `process.env.REACT_APP_...` use hota tha). Agar `.env` file nahi bani, to bas fallback value use hogi — ye normal hai, error nahi.

**Q3: `.env` file kahan banani hai?**
`frontend-shopster/` folder ke root mein (jahan `package.json` hai), naam `.env`. Restart `npm run dev` zaroori hai — Vite `.env` changes pe auto-reload nahi karta.

**Q4: `VITE_` prefix bhool gaya to?**
Variable `import.meta.env` mein dikhega hi nahi — Vite silently ignore kar dega security ke liye.

**Q5: `vite.config.js` mein proxy add karna chahiye kya?**
Abhi zaroorat nahi kyunki backend mein `cors()` already enabled hai (`server.js:19`), jo cross-origin requests allow karta hai. Proxy sirf tab chahiye hota jab CORS disable ho aur aap dev-server ke through backend ko forward karna chaho.

---

**Short summary jo yaad rakhna hai:**
1. `import.meta.env.VITE_API_URL` = Vite ka tarika environment-specific values (jaise API URL) code ke bahar rakhne ka.
2. `|| "http://localhost:3000/api"` = safety fallback jab tak `.env` set nahi hai.
3. `vite.config.js` = build tool ki settings (React plugin), environment variables se directly related nahi.
4. Ye sab isliye add kiya gaya taaki deploy karte time sirf `.env` change karna pade, code nahi.
