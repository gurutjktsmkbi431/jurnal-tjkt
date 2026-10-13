// Pembungkus tipis Firebase (Auth + Firestore). Dipakai oleh index.html (guru) dan siswa.html (siswa).
window.FB = {
  async init() {
    if (window.__FB_MOCK) return window.__FB_MOCK;
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('ISI')) throw new Error('NOCONFIG');
    const V = '10.12.2', B = 'https://www.gstatic.com/firebasejs/' + V + '/';
    const [A, Au, Fs] = await Promise.all([import(B + 'firebase-app.js'), import(B + 'firebase-auth.js'), import(B + 'firebase-firestore.js')]);
    const app = A.initializeApp(cfg), auth = Au.getAuth(app), db = Fs.getFirestore(app);
    const cur = () => auth.currentUser;
    return {
      auth: {
        anon: async () => { if (!cur()) await Au.signInAnonymously(auth); return cur(); },
        google: () => Au.signInWithPopup(auth, new Au.GoogleAuthProvider()),
        email: (e, p) => Au.signInWithEmailAndPassword(auth, e, p),
        out: () => Au.signOut(auth),
        onChange: cb => Au.onAuthStateChanged(auth, cb),
        user: cur
      },
      get: async p => { const s = await Fs.getDoc(Fs.doc(db, p)); return s.exists() ? s.data() : null; },
      set: (p, d, merge) => Fs.setDoc(Fs.doc(db, p), d, { merge: !!merge }),
      del: p => Fs.deleteDoc(Fs.doc(db, p)),
      list: async p => (await Fs.getDocs(Fs.collection(db, p))).docs.map(d => ({ path: d.ref.path, id: d.id, data: d.data() })),
      group: async n => (await Fs.getDocs(Fs.collectionGroup(db, n))).docs.map(d => ({ path: d.ref.path, id: d.id, data: d.data() }))
    };
  }
};
