const { Operator, Plan } = require('../models');
const rechargeService = require('../services/recharge.service');
const response = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');
const kwikapiService = require('../services/kwikapi.service');
const ezytmService = require('../services/ezytm.service');

// ─────────────────────────────────────────────────────────────────────────────
// TRAI 4-digit prefix → { op, circle } mapping
// op codes: AIRTEL, JIO, VI, BSNL, MTNL
// circle names match Indian telecom circles exactly
// ─────────────────────────────────────────────────────────────────────────────
const TRAI_PREFIX_MAP = {
  // === JIO ===
  '6000': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6001': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6002': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6003': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6004': { op: 'JIO', circle: 'Gujarat' },
  '6005': { op: 'JIO', circle: 'Karnataka' },
  '6006': { op: 'JIO', circle: 'Kerala' },
  '6007': { op: 'JIO', circle: 'Kolkata' },
  '6008': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6009': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '6200': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6201': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6202': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6203': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6204': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6205': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6206': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6207': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6208': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6209': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6210': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6211': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6212': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6213': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6214': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6215': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '6216': { op: 'JIO', circle: 'Rajasthan' },
  '6217': { op: 'JIO', circle: 'Rajasthan' },
  '6218': { op: 'JIO', circle: 'Rajasthan' },
  '6219': { op: 'JIO', circle: 'Rajasthan' },
  '6220': { op: 'JIO', circle: 'UP East' },
  '6221': { op: 'JIO', circle: 'UP East' },
  '6222': { op: 'JIO', circle: 'UP East' },
  '6223': { op: 'JIO', circle: 'UP East' },
  '6224': { op: 'JIO', circle: 'UP West' },
  '6225': { op: 'JIO', circle: 'UP West' },
  '6226': { op: 'JIO', circle: 'UP West' },
  '6227': { op: 'JIO', circle: 'UP West' },
  '6228': { op: 'JIO', circle: 'West Bengal' },
  '6229': { op: 'JIO', circle: 'West Bengal' },
  '6230': { op: 'JIO', circle: 'West Bengal' },
  '6231': { op: 'JIO', circle: 'West Bengal' },
  '6232': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6233': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6234': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6235': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6260': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6261': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6262': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6263': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6264': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6265': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6266': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6267': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6268': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6269': { op: 'JIO', circle: 'Madhya Pradesh' },
  '6300': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6301': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6302': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6303': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6304': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6305': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6306': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6307': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6308': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6309': { op: 'JIO', circle: 'Andhra Pradesh' },
  '6360': { op: 'JIO', circle: 'Tamil Nadu' },
  '6361': { op: 'JIO', circle: 'Tamil Nadu' },
  '6362': { op: 'JIO', circle: 'Tamil Nadu' },
  '6363': { op: 'JIO', circle: 'Tamil Nadu' },
  '6364': { op: 'JIO', circle: 'Tamil Nadu' },
  '6365': { op: 'JIO', circle: 'Tamil Nadu' },
  '6366': { op: 'JIO', circle: 'Tamil Nadu' },
  '6367': { op: 'JIO', circle: 'Tamil Nadu' },
  '6368': { op: 'JIO', circle: 'Tamil Nadu' },
  '6369': { op: 'JIO', circle: 'Tamil Nadu' },
  '6370': { op: 'JIO', circle: 'Assam' },
  '6371': { op: 'JIO', circle: 'Assam' },
  '6372': { op: 'JIO', circle: 'Assam' },
  '6373': { op: 'JIO', circle: 'Assam' },
  '6374': { op: 'JIO', circle: 'NE' },
  '6375': { op: 'JIO', circle: 'NE' },
  '6376': { op: 'JIO', circle: 'Himachal Pradesh' },
  '6377': { op: 'JIO', circle: 'Himachal Pradesh' },
  '6378': { op: 'JIO', circle: 'Himachal Pradesh' },
  '6379': { op: 'JIO', circle: 'Himachal Pradesh' },
  '6380': { op: 'JIO', circle: 'Karnataka' },
  '6381': { op: 'JIO', circle: 'Tamil Nadu' },
  '6382': { op: 'JIO', circle: 'Tamil Nadu' },
  '6383': { op: 'JIO', circle: 'Tamil Nadu' },
  '6384': { op: 'JIO', circle: 'Tamil Nadu' },
  '6385': { op: 'JIO', circle: 'Tamil Nadu' },
  '6386': { op: 'JIO', circle: 'Tamil Nadu' },
  '6387': { op: 'JIO', circle: 'Tamil Nadu' },
  '6388': { op: 'JIO', circle: 'Tamil Nadu' },
  '6389': { op: 'JIO', circle: 'Tamil Nadu' },
  '6390': { op: 'JIO', circle: 'Assam' },
  '6391': { op: 'JIO', circle: 'Assam' },
  '6392': { op: 'JIO', circle: 'Assam' },
  '6393': { op: 'JIO', circle: 'Assam' },
  '6394': { op: 'JIO', circle: 'Assam' },
  '6395': { op: 'JIO', circle: 'Assam' },
  '6396': { op: 'JIO', circle: 'Assam' },
  '6397': { op: 'JIO', circle: 'NE' },
  '6398': { op: 'JIO', circle: 'NE' },
  '6399': { op: 'JIO', circle: 'NE' },
  '7000': { op: 'JIO', circle: 'UP East' },
  '7001': { op: 'JIO', circle: 'UP East' },
  '7002': { op: 'JIO', circle: 'UP East' },
  '7003': { op: 'JIO', circle: 'UP East' },
  '7004': { op: 'JIO', circle: 'Delhi NCR' },
  '7005': { op: 'JIO', circle: 'UP East' },
  '7006': { op: 'JIO', circle: 'J&K' },
  '7007': { op: 'JIO', circle: 'UP East' },
  '7011': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7012': { op: 'JIO', circle: 'Kerala' },
  '7013': { op: 'JIO', circle: 'Kerala' },
  '7014': { op: 'JIO', circle: 'Rajasthan' },
  '7015': { op: 'JIO', circle: 'Rajasthan' },
  '7016': { op: 'JIO', circle: 'Rajasthan' },
  '7017': { op: 'JIO', circle: 'UP West' },
  '7018': { op: 'JIO', circle: 'UP West' },
  '7019': { op: 'JIO', circle: 'UP West' },
  '7020': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '7021': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '7022': { op: 'JIO', circle: 'Karnataka' },
  '7023': { op: 'JIO', circle: 'Karnataka' },
  '7024': { op: 'JIO', circle: 'Gujarat' },
  '7025': { op: 'JIO', circle: 'Gujarat' },
  '7026': { op: 'JIO', circle: 'Kerala' },
  '7027': { op: 'JIO', circle: 'Kerala' },
  '7028': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '7029': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '7030': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '7031': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '7032': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '7033': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '7034': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '7035': { op: 'JIO', circle: 'Bihar & Jharkhand' },
  '7036': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7037': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7038': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7039': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7040': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7041': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7042': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7043': { op: 'JIO', circle: 'Madhya Pradesh' },
  '7044': { op: 'JIO', circle: 'Madhya Pradesh' },
  '7045': { op: 'JIO', circle: 'Madhya Pradesh' },
  '7046': { op: 'JIO', circle: 'Kolkata' },
  '7047': { op: 'JIO', circle: 'Kolkata' },
  '7048': { op: 'JIO', circle: 'West Bengal' },
  '7049': { op: 'JIO', circle: 'West Bengal' },
  '7050': { op: 'JIO', circle: 'West Bengal' },
  '7051': { op: 'JIO', circle: 'West Bengal' },
  '7052': { op: 'JIO', circle: 'West Bengal' },
  '7053': { op: 'JIO', circle: 'West Bengal' },
  '7054': { op: 'JIO', circle: 'West Bengal' },
  '7055': { op: 'JIO', circle: 'West Bengal' },
  '7056': { op: 'JIO', circle: 'West Bengal' },
  '7057': { op: 'JIO', circle: 'West Bengal' },
  '7058': { op: 'JIO', circle: 'West Bengal' },
  '7059': { op: 'JIO', circle: 'West Bengal' },
  '7060': { op: 'JIO', circle: 'UP East' },
  '7061': { op: 'JIO', circle: 'UP East' },
  '7062': { op: 'JIO', circle: 'UP East' },
  '7063': { op: 'JIO', circle: 'UP East' },
  '7064': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7065': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7066': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '7067': { op: 'JIO', circle: 'Rajasthan' },
  '7068': { op: 'JIO', circle: 'Gujarat' },
  '7069': { op: 'JIO', circle: 'Gujarat' },
  '7070': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7071': { op: 'JIO', circle: 'Andhra Pradesh' },
  '7072': { op: 'JIO', circle: 'Tamil Nadu' },
  '7073': { op: 'JIO', circle: 'Tamil Nadu' },
  '7074': { op: 'JIO', circle: 'Odisha' },
  '7075': { op: 'JIO', circle: 'Odisha' },
  '7076': { op: 'JIO', circle: 'Karnataka' },
  '7077': { op: 'JIO', circle: 'Karnataka' },
  '7078': { op: 'JIO', circle: 'Karnataka' },
  '7079': { op: 'JIO', circle: 'Karnataka' },
  '7080': { op: 'JIO', circle: 'UP East' },
  '7081': { op: 'JIO', circle: 'UP East' },
  '7082': { op: 'JIO', circle: 'UP East' },
  '7083': { op: 'JIO', circle: 'UP East' },
  '7084': { op: 'JIO', circle: 'Rajasthan' },
  '7085': { op: 'JIO', circle: 'Rajasthan' },
  '7086': { op: 'JIO', circle: 'Assam' },
  '7087': { op: 'JIO', circle: 'Assam' },
  '7088': { op: 'JIO', circle: 'Haryana' },
  '7089': { op: 'JIO', circle: 'Haryana' },
  '7090': { op: 'JIO', circle: 'UP West' },
  '7091': { op: 'JIO', circle: 'UP West' },
  '7092': { op: 'JIO', circle: 'UP West' },
  '7093': { op: 'JIO', circle: 'Madhya Pradesh' },
  '7094': { op: 'JIO', circle: 'Madhya Pradesh' },
  '7095': { op: 'JIO', circle: 'Haryana' },
  '7096': { op: 'JIO', circle: 'Haryana' },
  '7097': { op: 'JIO', circle: 'Haryana' },
  '7098': { op: 'JIO', circle: 'Haryana' },
  '7099': { op: 'JIO', circle: 'Haryana' },
  // === AIRTEL ===
  '7289': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7428': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7503': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7678': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7703': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7827': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '7840': { op: 'AIRTEL', circle: 'Mumbai' },
  '8130': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8447': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8448': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8527': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8800': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8810': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8826': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8860': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8882': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '8929': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9312': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9313': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9314': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9315': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9316': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9350': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9560': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9643': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9711': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9717': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9810': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9811': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9818': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9868': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9871': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9873': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9891': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9899': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9910': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9911': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9953': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9958': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9971': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9990': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '9999': { op: 'AIRTEL', circle: 'Delhi NCR' },
  // === VI (Vodafone Idea) ===
  '7506': { op: 'VI', circle: 'Maharashtra & Goa' },
  '7533': { op: 'VI', circle: 'Maharashtra & Goa' },
  '7588': { op: 'VI', circle: 'Maharashtra & Goa' },
  '7720': { op: 'VI', circle: 'Maharashtra & Goa' },
  '7798': { op: 'VI', circle: 'Maharashtra & Goa' },
  '8087': { op: 'VI', circle: 'Maharashtra & Goa' },
  '8291': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9004': { op: 'VI', circle: 'Mumbai' },
  '9175': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9321': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9322': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9323': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9324': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9325': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9326': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9372': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9373': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9702': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9769': { op: 'VI', circle: 'Mumbai' },
  '9819': { op: 'VI', circle: 'Mumbai' },
  '9820': { op: 'VI', circle: 'Mumbai' },
  '9821': { op: 'VI', circle: 'Mumbai' },
  '9833': { op: 'VI', circle: 'Mumbai' },
  '9867': { op: 'VI', circle: 'Mumbai' },
  '9870': { op: 'VI', circle: 'Delhi NCR' },
  '9892': { op: 'VI', circle: 'Mumbai' },
  '9920': { op: 'VI', circle: 'Mumbai' },
  '9930': { op: 'VI', circle: 'Maharashtra & Goa' },
  '9967': { op: 'VI', circle: 'Mumbai' },
  '9987': { op: 'VI', circle: 'Mumbai' },
  // === BSNL ===
  '7086': { op: 'BSNL', circle: 'Assam' },
  '8729': { op: 'BSNL', circle: 'Assam' },
  '9418': { op: 'BSNL', circle: 'Himachal Pradesh' },
  '9435': { op: 'BSNL', circle: 'Assam' },
  '9436': { op: 'BSNL', circle: 'NE' },
  '9459': { op: 'BSNL', circle: 'Himachal Pradesh' },
  '9816': { op: 'BSNL', circle: 'Himachal Pradesh' },
  '9817': { op: 'BSNL', circle: 'Himachal Pradesh' },
  '9856': { op: 'BSNL', circle: 'Assam' },
  '9862': { op: 'BSNL', circle: 'Assam' },
  '9882': { op: 'BSNL', circle: 'Himachal Pradesh' },
};

// 2-digit fallback map (first 2 digits of 10-digit mobile number)
const TWO_DIGIT_MAP = {
  '60': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '61': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '62': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '63': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '64': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '65': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '66': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '67': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '68': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '69': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '70': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '73': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '74': { op: 'JIO', circle: 'Maharashtra & Goa' },
  '79': { op: 'JIO', circle: 'Gujarat' },
  '72': { op: 'AIRTEL', circle: 'Maharashtra & Goa' },
  '75': { op: 'VI', circle: 'Maharashtra & Goa' },
  '76': { op: 'VI', circle: 'UP East' },
  '77': { op: 'VI', circle: 'UP East' },
  '78': { op: 'AIRTEL', circle: 'Karnataka' },
  '80': { op: 'AIRTEL', circle: 'Karnataka' },
  '81': { op: 'AIRTEL', circle: 'Karnataka' },
  '82': { op: 'AIRTEL', circle: 'Karnataka' },
  '83': { op: 'AIRTEL', circle: 'Karnataka' },
  '84': { op: 'AIRTEL', circle: 'Karnataka' },
  '85': { op: 'AIRTEL', circle: 'Karnataka' },
  '86': { op: 'AIRTEL', circle: 'Karnataka' },
  '87': { op: 'AIRTEL', circle: 'Karnataka' },
  '88': { op: 'AIRTEL', circle: 'Karnataka' },
  '89': { op: 'AIRTEL', circle: 'Karnataka' },
  '90': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '91': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '92': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '93': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '94': { op: 'AIRTEL', circle: 'Maharashtra & Goa' },
  '95': { op: 'AIRTEL', circle: 'Maharashtra & Goa' },
  '96': { op: 'VI', circle: 'Maharashtra & Goa' },
  '97': { op: 'VI', circle: 'Maharashtra & Goa' },
  '98': { op: 'AIRTEL', circle: 'Delhi NCR' },
  '99': { op: 'AIRTEL', circle: 'Delhi NCR' },
};

// KwikAPI operator ID map
const KWIKAPI_OP_ID = { AIRTEL: 1, VI: 3, JIO: 8, BSNL: 4, MTNL: 5 };

// ─────────────────────────────────────────────────────────────────────────────
// Local TRAI prefix lookup — returns { op, circle } or null
// ─────────────────────────────────────────────────────────────────────────────
const lookupByTRAIPrefix = (phone) => {
  const p4 = phone.slice(0, 4);
  if (TRAI_PREFIX_MAP[p4]) return TRAI_PREFIX_MAP[p4];
  const p2 = phone.slice(0, 2);
  if (TWO_DIGIT_MAP[p2]) return TWO_DIGIT_MAP[p2];
  return null;
};

const normalizeOperatorCode = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('jio')) return 'JIO';
  if (n.includes('airtel')) return 'AIRTEL';
  if (n.includes('idea') || n.includes('vodafone') || n.includes('vi')) return 'VI';
  if (n.includes('bsnl')) return 'BSNL';
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /operators?type=
// ─────────────────────────────────────────────────────────────────────────────
const getOperators = async (req, res) => {
  const { type } = req.query;
  try {
    const whereClause = { status: true };
    if (type) whereClause.type = type;
    const operators = await Operator.findAll({ where: whereClause });
    return response.success(res, operators, 'Operators retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch operators', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /plans?operator=&circle=&operatorCode=
// ─────────────────────────────────────────────────────────────────────────────
const getPlans = async (req, res) => {
  const { operator, circle, operatorCode } = req.query;

  // Map operator name to KwikAPI operator ID
  const KWIKAPI_OP_MAP = {
    'JIO': 8, 'AIRTEL': 1, 'VI': 3, 'BSNL': 4,
    'jio': 8, 'airtel': 1, 'vi': 3, 'bsnl': 4,
    'Jio': 8, 'Airtel': 1,
    'Reliance Jio': 8,
    'airtel prepaid': 1, 'Airtel Prepaid': 1,
  };

  // Map circle name to KwikAPI circle code
  const CIRCLE_CODE_MAP = {
    'Delhi NCR': '1', 'Delhi': '1',
    'Maharashtra & Goa': '4', 'Maharashtra': '4', 'Mumbai': '4',
    'Andhra Pradesh': '5', 'Andhra': '5',
    'Tamil Nadu': '23',
    'Karnataka': '7',
    'Gujarat': '8',
    'UP East': '9', 'UP East (Uttar Pradesh)': '9',
    'Madhya Pradesh': '10', 'Chhattisgarh': '10',
    'West Bengal': '12',
    'Rajasthan': '13',
    'Kerala': '14',
    'Punjab': '15',
    'Haryana': '16',
    'Bihar & Jharkhand': '17', 'Bihar': '17', 'Jharkhand': '17',
    'Odisha': '18',
    'Assam': '19',
    'Himachal Pradesh': '21', 'HP': '21',
    'J&K': '22', 'Jammu & Kashmir': '22',
    'Kolkata': '1',
    'UP West': '42',
    'NE': '28',
  };

  const opId = KWIKAPI_OP_MAP[operator] || KWIKAPI_OP_MAP[operatorCode];
  const circleCode = CIRCLE_CODE_MAP[circle];

  if (!opId) {
    return response.success(res, { plans: [], categories: [] }, 'No plans found for operator');
  }

  try {
    const result = await kwikapiService.getMobileRechargePlans(opId, circleCode || '1');

    if (!result.success || result.plans.length === 0) {
      // Return fallback plans from DB
      const dbPlans = await Plan.findAll({
        where: { operator_id: undefined, status: true },
        limit: 50,
      }).catch(() => []);
      return response.success(res, { plans: dbPlans, categories: [] }, 'Plans retrieved from cache');
    }

    // Normalize KwikAPI plan format
    const normalizedPlans = result.plans.map(p => ({
      id: p.plan_id || p.id,
      amount: parseFloat(p.rs || p.amount || p.price || 0),
      validity: p.validity || p.plan_validity || 'N/A',
      data: p.data || p.data_benefit || '',
      description: p.description || p.detail || p.benefit || '',
      talktime: p.talktime || '',
      sms: p.sms || '',
      category: p.type || p.plan_type || p.category || 'Others',
      kwikApiPlanId: p.plan_id || p.id,
    }));

    return response.success(res, { plans: normalizedPlans }, 'Plans retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch plans', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /detect-operator
// ─────────────────────────────────────────────────────────────────────────────
const detectOperator = async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return response.error(res, 'Invalid 10-digit phone number', 400);
  }

  let detectedOpCode = null;
  let detectedCircle = null;
  let success = false;

  // 1. Try KwikAPI live lookup first (3 second timeout)
  if (process.env.KWIKAPI_API_KEY && process.env.KWIKAPI_API_KEY.trim() !== '') {
    try {
      const result = await Promise.race([
        kwikapiService.detectOperatorAndCircle(phone),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]);
      if (result && result.success && result.operator) {
        detectedOpCode = normalizeOperatorCode(result.operator);
        detectedCircle = result.circle || null;
        success = !!detectedOpCode;
      }
    } catch (e) {
      console.error('KwikAPI live detection error:', e.message);
    }
  }

  // 2. Try Ezytm live lookup if KwikAPI failed
  if (!success && process.env.EZYTM_API_PASSWORD && process.env.EZYTM_API_PASSWORD.trim() !== '') {
    try {
      const result = await Promise.race([
        ezytmService.detectOperator(phone),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]);
      if (result && result.success && result.operator) {
        detectedOpCode = normalizeOperatorCode(result.operator);
        detectedCircle = result.circle || null;
        success = !!detectedOpCode;
      }
    } catch (e) {
      console.error('Ezytm live detection error:', e.message);
    }
  }

  // 3. Fallback: Comprehensive TRAI 4-digit prefix table
  if (!success) {
    const match = lookupByTRAIPrefix(phone);
    if (match) {
      detectedOpCode = match.op;
      detectedCircle = match.circle;
    } else {
      // Last-resort hardcoded fallback
      const firstDigit = phone.charAt(0);
      if (firstDigit === '9' || firstDigit === '8') {
        detectedOpCode = 'AIRTEL';
        detectedCircle = 'Delhi NCR';
      } else if (firstDigit === '7') {
        detectedOpCode = 'JIO';
        detectedCircle = 'Maharashtra & Goa';
      } else {
        detectedOpCode = 'JIO';
        detectedCircle = 'Maharashtra & Goa';
      }
    }
  }

  const resolvedCode = detectedOpCode || 'JIO';
  const kwikApiOpId = KWIKAPI_OP_ID[resolvedCode] || 8;

  try {
    const operator = await Operator.findOne({ where: { code: resolvedCode } });
    if (!operator) {
      return response.error(res, 'Failed to resolve active operator', 404);
    }

    return response.success(res, {
      operator,
      circle: detectedCircle || 'Maharashtra & Goa',
      kwikApiOpId,
    }, 'Operator detected successfully');
  } catch (err) {
    return response.error(res, 'Auto-detection failed', 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /initiate
// ─────────────────────────────────────────────────────────────────────────────
const initiateRecharge = async (req, res) => {
  const userId = req.user.id;
  const { type, operatorCode, accountNo, circle, amount, couponCode, validityDays } = req.body;

  try {
    const transaction = await rechargeService.initiateRecharge(userId, {
      type,
      operatorCode,
      accountNo,
      circle,
      amount,
      couponCode,
    });

    // After a successful recharge, save validity_expires_at if validity info available
    if (transaction && transaction.status === 'success' && validityDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(validityDays));
      await transaction.update({
        validity_expires_at: expiresAt,
        validity_days: parseInt(validityDays),
      }).catch(() => {});
    }

    return response.success(res, transaction, 'Transaction processed', 201);
  } catch (err) {
    return response.error(res, err.message || 'Recharge processing failed', 400);
  }
};

module.exports = {
  getOperators,
  getPlans,
  detectOperator,
  initiateRecharge,
};
