/**
 * Fichier : testSupabase.js
 * Rôle : Script de test pour vérifier la connexion à Supabase.
 * Utilité : Permet de valider que les variables d'environnement (.env) et l'accès réseau fonctionnent.
 * À exécuter : node src/config/testSupabase.js 
 */

require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error(" Variables d'environnement manquantes")
  process.exit(1)
}

// initialiser le client Supabase
const supabase = createClient(url, key)

async function testSupabaseConnection() {
  // lancer une requête simple (ex: select 1 table ou ping)
  //  afficher le résultat/erreur dans la console
  
  const { data, error } = await supabase
    .from('challenges') // remplacé par une table existante
    .select('*')
    

  if (error) {
    console.error(" Erreur Supabase :", error.message)
    process.exit(1)
  }

  console.log(" Connexion OK ! Données :", data)
}

testSupabaseConnection()
