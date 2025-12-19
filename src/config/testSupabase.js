require('dotenv').config()



const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error(" Variables d'environnement manquantes")
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data, error } = await supabase
    .from('badges') // remplacé par une table existante
    .select('*')
    .limit(1)

  if (error) {
    console.error(" Erreur Supabase :", error.message)
    process.exit(1)
  }

  console.log(" Connexion OK ! Données :", data)
}

main()
