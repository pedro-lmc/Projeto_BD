const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');
const pacienteController = require('../controllers/pacienteController');
const leitoController = require('../controllers/leitoController');
const configuracaoController = require('../controllers/configuracaoController');
const evolucaoController = require('../controllers/evolucaoController');

router.get('/atendimentos', atendimentoController.listarAtendimentos);
router.get('/atendimentos/hoje', atendimentoController.listarAtendimentos);
router.post('/atendimentos', atendimentoController.criarAtendimento);
router.patch('/atendimentos/:id/status', atendimentoController.atualizarStatus);
router.delete('/atendimentos/:id', atendimentoController.excluirAtendimento);

router.get('/pacientes', pacienteController.listarPacientes);
router.post('/pacientes', pacienteController.criarPaciente);
router.get('/pacientes/:pacienteId/evolucoes', evolucaoController.listarEvolucoesPorPaciente);

router.get('/leitos', leitoController.listarLeitos);
router.patch('/leitos/:id/status', leitoController.atualizarStatusLeito);

router.get('/configuracoes', configuracaoController.obterConfiguracao);
router.put('/configuracoes', configuracaoController.atualizarConfiguracao);

router.post('/evolucoes', evolucaoController.criarEvolucao);

module.exports = router;
