const winston = require('winston');
const moment = require('moment');

if (process.argv.length !== 3) {
    winston.error('Bad argument. Example: node dian 20170608');
    return;
}

const arg = process.argv[2];
if (!arg) {
    winston.error('missing argument');
    return;
}

const mdate = moment(arg, 'YYYY-MM-DD');
if (!mdate.isValid()) {
    winston.error('invalid argument');
    return;
}

const startDate = mdate.format('YYYY-MM-DD');
const endDate = mdate.add(1, 'day').format('YYYY-MM-DD');
winston.info(startDate);
return;

const soap = require('soap');
const parseString = require('xml2js').parseString;
const util = require('util'); 
const sql = require('mssql');

const url = 'http://report.dalabs.cn/RasClientDetail.asmx?wsdl';

const args = {
    ClientID: '北京华兆益生健康管理机构',
    ClientGUID: 'D15489B40FD645068A3CF2460542DC28',
    StartDate: startDate,
    EndDate: endDate,
    num: 1
};

const config80 = {
    user: 'sa',
    password: 'sina.com.1',
    server: '192.168.100.80',
    database: 'MyWebFlow'
};

const sqlstr = 'insert into ZZ_DianOriginal(request, response) VALUES(@req, @res)';

var pool80 = new sql.ConnectionPool(config80, err => {
    if (err) {
        winston.error('db80 init error', err);
        return;
    }
    soap.createClient(url, function (err, client) {
        client.GetDetailData5ByPage(args, function (err, result) {
            if (err) {
                winston.error('call WebService failed', err);
                return;
            }
            let x = result.GetDetailData5ByPageResult;
            x = '<root>' + x + '</root>'
            console.log(x);
/*
            pool80.request()
            .input('req', startDate)
            .input('res', x)
            .query(sqlstr, (err, result) => {
                if (err) {
                    winston.error('db80 request error', err);
                    return;
                }
            });
            console.log(x);
            parseString(x, {explicitArray: false}, function(err, result1) {
                console.log(util.inspect(result1, false, null))
            });
*/
        });
    });
})

pool80.on('error', err => {
    winston.error('db80 error', err)
});
