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
  const { data, error } = await supabaseAdmin.from(TABLE).insert(req.body).select('*').single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
}

exports.update = async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabaseAdmin.from(TABLE).update(req.body).eq('id', id).select('*').single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

exports.remove = async (req, res) => {
  const { id } = req.params
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id)
  if (error) return res.status(400).json({ error: error.message })
  res.status(204).send()
}
