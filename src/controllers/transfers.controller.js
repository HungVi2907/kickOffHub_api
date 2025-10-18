const db = require('../config/db');

const listTransfers = async (req, res) => {
  try {
    const { playerId } = req.query;
    const sql = playerId
      ? `SELECT transfer_id, player_id, from_team_id, to_team_id, transfer_date, transfer_type, transfer_fee_amount, currency
         FROM transfers WHERE player_id = ? ORDER BY transfer_date DESC`
      : `SELECT transfer_id, player_id, from_team_id, to_team_id, transfer_date, transfer_type, transfer_fee_amount, currency
         FROM transfers ORDER BY transfer_date DESC`;
    const params = playerId ? [playerId] : [];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transfers', details: error.message });
  }
};

const getTransferById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT transfer_id, player_id, from_team_id, to_team_id, transfer_date, transfer_type, transfer_fee_amount, currency
       FROM transfers WHERE transfer_id = ? LIMIT 1`,
      [req.params.transferId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transfer', details: error.message });
  }
};

const createTransfer = async (req, res) => {
  const {
    player_id: playerId,
    from_team_id: fromTeamId,
    to_team_id: toTeamId,
    transfer_date: transferDate,
    transfer_type: transferType,
    transfer_fee_amount: transferFeeAmount,
    currency
  } = req.body;

  try {
    await db.query(
      `INSERT INTO transfers (player_id, from_team_id, to_team_id, transfer_date, transfer_type, transfer_fee_amount, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [playerId, fromTeamId, toTeamId, transferDate, transferType, transferFeeAmount, currency]
    );

    res.status(201).json({ message: 'Transfer created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transfer', details: error.message });
  }
};

const updateTransfer = async (req, res) => {
  const {
    player_id: playerId,
    from_team_id: fromTeamId,
    to_team_id: toTeamId,
    transfer_date: transferDate,
    transfer_type: transferType,
    transfer_fee_amount: transferFeeAmount,
    currency
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE transfers
       SET player_id = ?, from_team_id = ?, to_team_id = ?, transfer_date = ?, transfer_type = ?, transfer_fee_amount = ?, currency = ?
       WHERE transfer_id = ?`,
      [playerId, fromTeamId, toTeamId, transferDate, transferType, transferFeeAmount, currency, req.params.transferId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json({ message: 'Transfer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transfer', details: error.message });
  }
};

const deleteTransfer = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM transfers WHERE transfer_id = ?',
      [req.params.transferId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json({ message: 'Transfer removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transfer', details: error.message });
  }
};

module.exports = {
  listTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
  deleteTransfer
};
