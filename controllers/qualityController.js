const { response } = require('express');
require('dotenv').config();
//const archiver = require('archiver');
var express = require('express');
var app = express();

exports.getQualityControl=async(req,res, next)=>{
    console.log("getQualityControl");
    try{
		var sql = "";
		sql = "SELECT czip.aipn_claim_zip_id, czip.hcode, czip.sessionno, czip.zip_file,'' as status_selected " +
            "From ssn_data.dbo.aipn_t_claim_zip czip "
            //+"left join ssn_data.dbo.aipn_t_ipdx ipdx on aipn.aipn_id = ipdx.aipn_id "
            +"Where  czip.active = '1' and czip.status_claim = '0' "
            +"Order By czip.aipn_id ; ";
	}catch{
    res.status(500).json({ success: false, error: error.message });
	}
	finally{

	}
};