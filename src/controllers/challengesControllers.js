const { supabaseAdmin } = require('../config/supabaseAdmin')

const TABLE = 'challenges'

exports.list = async (req, res) => {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

exports.getById = async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('id', id).single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
}

exports.create = async (req, res) => {
  const { data, error } = await supabaseAdmin.from(TABLE).insert(req.body).select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("challenges")
      .update(req.body)
      .eq("id", id)
      .select("*");

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Challenge introuvable" });
    }

    return res.json(data[0]); // 1ère ligne mise à jour
  } catch (e) {
    console.error("[challenges] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.remove = async (req, res) => {
  const { id } = req.params
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id)
  if (error) return res.status(400).json({ error: error.message })
  res.status(204).send()
}
