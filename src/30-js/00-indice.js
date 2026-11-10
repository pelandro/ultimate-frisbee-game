/* =====================================================================================================================
   ULTIMATE FRISBEE — indice del codice (un solo file; le sezioni sono in quest'ordine)
   ---------------------------------------------------------------------------------------------------------------------
   SIMULAZIONE (tra SIM_START e SIM_END: nessun accesso alla pagina, si puo' eseguire e provare da riga di comando)
     1. costanti del campo, stato G, giocatori e HOOKS (ganci verso l'interfaccia)
     2. Overall per ruolo, tratti, velocita' di crescita
     3. movimento, schemi e playbook, linee d'attacco e di difesa, inizio meta
     4. IA dell'attacco (tagli, chiamate) e della difesa (marcature, zona, aiuti, cambi)
     5. campo di allenamento (G.drill): possesso da fermo, difensori a bordo campo, eventi
     6. lanci: tipi, traiettorie, precisione, marcatore, handblock; volo del disco, prese, duelli, tuffi
     7. IA di chi ha il disco, pull, meta, identita' tattica delle squadre, half time, ciclo update()
     8. progressione: talento e potenziale, esperienza (XP), allenamenti, eta'
     9. rose: generazione, roster reali, formazione, infortuni, forma del giorno
    10. partite simulate (simPointP, simMatch) e TEST AUTOMATICI (selfTestPlan, selfTestRun, selfTest)
   INTERFACCIA
    11. disegno a pixel: primitive, campo, divise e campi, omini, disco, mira, effetti, stacchi
    12. HUD, input (trascinamento, tastiera, controller), impostazioni e diagnostica
    13. schemi, fine partita, salvataggio (versione 3, copia di sicurezza, esporta/importa)
    14. squadre e roster ufficiali 2026, calendario, classifica, fine stagione
    15. carriera: rosa e linee, economia e stipendi, mercato e scouting, obiettivi, premi, evoluzione del campionato
    16. partita veloce, Ultimate Team, torneo personalizzato, campo di allenamento (tutorial, libero, sfide)
    17. schermate della carriera (cruscotto, rosa, allenamenti, mercato, club, classifica), audio, ciclo principale
   ===================================================================================================================== */

(()=>{
'use strict';
