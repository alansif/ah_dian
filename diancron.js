const winston = require('winston');
const moment = require('moment');
const cron = require('cron').CronJob;
const soap = require('soap');
const sql = require('mssql');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {'timestamp':() => moment().format()});

const config80 = {
    user: 'sa',
    password: 'sina.com.1',
    server: '192.168.100.80',
    database: 'MyWebFlow'
};

const sqlstr = 'insert into ZZ_DianOriginal(request, response) VALUES(@req, @res)';

const url = 'http://report.dalabs.cn/RasClientDetail.asmx?wsdl';

sql.on('error', err => {
	winston.error(err)
});

function writedb(reqdate, resxml) {
	sql.connect(config80, err => {
		if (err) {
			console.error(err);
			return;
		}
		new sql.Request()
			.input('req', reqdate)
			.input('res', resxml)
			.query(sqlstr, (err, result) => {
				if (err) {
					console.error(err);
					return;
				}
				winston.info("data was wrote into db80");
				sql.close();
		});
	});
}

function workload() {
	let d1 = moment(new Date());
	let d1s = d1.format('YYYY-MM-DD');
	let d0 = d1.add(-1, 'day');
	let d0s = d0.format('YYYY-MM-DD');
	const args = {
	    ClientID: '北京华兆益生健康管理机构',
	    ClientGUID: 'D15489B40FD645068A3CF2460542DC28',
	    StartDate: d0s,
	    EndDate: d1s,
	    num: 1
	};
	winston.info('fetching data ' + d0s + ' - ' + d1s);
	soap.createClient(url, function (err, client) {
		client.GetDetailData5ByPage(args, function (err, result) {
			if (err) {
				winston.error(err);
				return;
			}
			winston.info('data fetched');
			let x = result.GetDetailData5ByPageResult;
			x = '<root>' + x + '</root>'
			writedb(d0s, x);
		});
	});
}

const cronstr = '0 23 22 * * *';

var job = new cron({
	cronTime: cronstr,
	onTick: workload,
	start: false
});

job.start();

winston.info('begin running on [' + cronstr +']');

