/* ---- profilo «bilanciato» per le statistiche da un Overall (utStats): a meta' tra handler e cutter. Lo usano le giocatrici del campionato Women con mete e
   assist simili (ruolo B in 37-leghe/00-dati-women.js); la carta resta un cutter (usCard), e' il profilo a essere misto ---- */
UT_OFF.B={};for(const k of KEYS)UT_OFF.B[k]=Math.round((UT_OFF.H[k]+UT_OFF.C[k])/2);
