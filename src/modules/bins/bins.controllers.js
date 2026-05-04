const binsService = require("./bins.service");

exports.getAll = async (req, res, next) => {
  try {
    const { zone_id, type } = req.query;
    const bins = await binsService.listBins({ zone_id, type });
    return res.status(200).json(bins);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bin = await binsService.getBinById(id);
    return res.status(200).json(bin);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const bin = await binsService.createBin(req.body);
    return res.status(201).json(bin);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBin = await binsService.updateBin(id, req.body);
    return res.status(200).json(updatedBin);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await binsService.deleteBin(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};