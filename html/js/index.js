if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

if (!String.prototype.escapedHtml) {
  String.prototype.escapedHtml = function() {
	  var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	  };
	  return this.replace(/[&<>"']/g, function(m) { return map[m]; });
	};
}

if (!String.prototype.cleanPhoneNumber) {
  String.prototype.cleanPhoneNumber = function() {
	  var map = {
		' ': '',
		'-': '',
		'/': '',
		'(': '',
		")": ''
	  };
	  string = this.replace('(0)', '');
	  return string.replace(/[ \-\/\(\)]/g, function(m) { return map[m]; });
	};
}


function UIAction(app, callback, data = null) {

    this.app = app;
    this.callback = callback;
    this.data = data;

    this.execute = function() {
        this.app.ui_action_in_progress = this;
        this.callback(this);
    };

    this.finish = function() {
		app = this.app;
        app.ui_action_in_progress = null;
		setTimeout(function(){ app.main_loop_interval(); }, 20);
    }
};

function ActionStack(app) {

    this.app = app;
    this.array = [];

    this.push = function(action_object) {
		app = this.app;
        this.array.push(action_object);
		setTimeout(function(){ app.main_loop_interval(); }, 20);
    }

    this.shift = function() {
        return this.array.shift();
    }
	
	this.count = function() {
		return this.array.length;
	}
}


function Application() {

    // Initialisation
	
    this.ui_action_stack = new ActionStack(this);
    this.ui_action_in_progress = null;
    this.ui_active_page = null;
	this.ui_active_btn = null;
	
	this.data = {};
	this.office_vcard = '';
	this.messenger_link_office = '';
	this.home_vcard = '';
	this.blob_to_share = null;

    // Methods

	this.switch_pages = function(action) {
		app = action.app;
		btn_id = action.data['btn_id'];
		page_id = action.data['page_id'];
		setTimeout(function() {
			// Fade out active page
			app.ui_active_page.classList.add('invisible_page');
			// Switch to new active button
			app.ui_active_btn.classList.remove('selected_btn');
			app.ui_active_btn = document.getElementById(btn_id);
			app.ui_active_btn.classList.add('selected_btn');
		}, 20);
		setTimeout(function() {
			// Switch to new active page
			app.ui_active_page.classList.add('hidden_page');
			app.ui_active_page = document.getElementById(page_id);
			app.ui_active_page.classList.remove('hidden_page');
		}, 540);
		setTimeout(function() {
			// Switch to new active page
			app.ui_active_page.classList.remove('invisible_page');
		}, 560);
		setTimeout(function() {
			// Finish up
			action.finish();
		}, 1080);
	};

	this.update_display_page = function() {
	
		app = this;
		app.girocode_txt = "BCD\n";
		app.girocode_txt += "002\n";
		app.girocode_txt += "1\n";
		app.girocode_txt += "SCT\n";
		app.girocode_txt += app.data['bic'].trim() + "\n";
		app.girocode_txt += app.data['recipient'].trim() + "\n";
		app.girocode_txt += app.data['iban'].trim() + "\n";
		app.girocode_txt += app.data['currency']+(parseFloat(app.data['amount'])).toFixed(2) + "\n";
		app.girocode_txt += "\n";
		app.girocode_txt += "\n";
		app.girocode_txt += app.data['subject'] + "\n";
	    app.girocode_txt += "\n";
	    
	    currency_display = document.getElementById('currency_display');
	    currency_display.innerHTML = app.data['currency'];
		
		display = document.getElementById('girocode_text');
		display.innerHTML = '';
		

		headline_p = document.createElement('p');
		headline_p.className = 'headline';
		headline_p.innerHTML = 'Bankverbindung';
		display.appendChild(headline_p);

		recipient_text = app.data['recipient'].trim();
		if (recipient_text.length > 0) {
		    recipient_label_span = document.createElement('span');
		    recipient_label_span.className = 'label';
		    recipient_label_span.innerHTML = 'An: '
		    recipient_span = document.createElement('span');
		    recipient_span.innerHTML = recipient_text.escapedHtml();
			recipient_p = document.createElement('p');
			recipient_p.className = 'recipient';
			recipient_p.append(recipient_label_span);
			recipient_p.append(recipient_span);
			display.appendChild(recipient_p);
		}
		iban_text = app.data['iban'].trim();
        iban_array = iban_text.match(/.{1,4}/g);
        iban_text = iban_array.join(' ');
		if (iban_text.length > 0) {
		    iban_label_span = document.createElement('span');
		    iban_label_span.className = 'label';
		    iban_label_span.innerHTML = 'IBAN: '
		    iban_span = document.createElement('span');
		    iban_span.innerHTML = iban_text.escapedHtml();
			iban_p = document.createElement('p');
			iban_p.className = 'iban';
			iban_p.append(iban_label_span);
			iban_p.append(iban_span);
			display.appendChild(iban_p);
		}
		bic_text = app.data['bic'].trim();
		if (bic_text.length > 0) {
		    bic_label_span = document.createElement('span');
		    bic_label_span.className = 'label';
		    bic_label_span.innerHTML = 'BIC: '
		    bic_span = document.createElement('span');
		    bic_span.innerHTML = bic_text.escapedHtml();
			bic_p = document.createElement('p');
			bic_p.className = 'iban';
			bic_p.append(bic_label_span);
			bic_p.append(bic_span);
			display.appendChild(bic_p);
		}
		currency_text = app.data['currency'].trim() + " ";
	    amount_text = (parseFloat(app.data['amount'])).toFixed(2);
		if (currency_text.length > 1) {
			currency_span = document.createElement('span');
			currency_span.className = 'currency';
			currency_span.innerHTML = currency_text.escapedHtml();
			amount_span = document.createElement('sapn');
			amount_span.className = 'amount';
			amount_span.innerHTML = amount_text.escapedHtml();
			money_p = document.createElement('p');
			money_p.className = 'money';
            money_p.append(currency_span);
            money_p.append(amount_span);
			display.appendChild(money_p);
		}
		subject_text = app.data['subject'].trim();
		if (subject_text.length > 0) {
		    subject_label_span = document.createElement('span');
		    subject_label_span.className = 'label';
		    subject_label_span.innerHTML = 'Zweck: '
		    subject_span = document.createElement('span');
		    subject_span.innerHTML = subject_text.escapedHtml();
			subject_p = document.createElement('p');
			subject_p.className = 'iban';
			subject_p.append(subject_label_span);
			subject_p.append(subject_span);
			display.appendChild(subject_p);
		}
		console.log(app.girocode_txt);
		qrcode = new QRCode({ msg: app.girocode_txt , ecl: 'L'});
		qrcode_display = document.getElementById('girocode_qrcode');
		qrcode_display.innerHTML = '';
		qrcode_display.appendChild(qrcode);
		qrcode.setAttribute("width", "100%");
		qrcode.setAttribute("height", "100%");
	};
	
    // Input events

	this.click_girocode_btn = function(e) {
		action = new UIAction(app, app.switch_pages, data = {'btn_id': 'girocode_btn', 'page_id':'girocode_page'});
		app.ui_action_stack.push(action);
	};
	this.click_payment_settings_btn = function(e) {
		action = new UIAction(app, app.switch_pages, data = {'btn_id': 'payment_settings_btn', 'page_id':'payment_settings_page'});
		app.ui_action_stack.push(action);
	};
	this.click_bank_account_settings_btn = function(e) {
		action = new UIAction(app, app.switch_pages, data = {'btn_id': 'bank_account_settings_btn', 'page_id':'bank_account_settings_page'});
		app.ui_action_stack.push(action);
	};
	
	this.change_payment_settings_input = function(e) {
		app.data[e.target.name] = e.target.value;
		window.localStorage.setItem(e.target.name, e.target.value);
		app.update_display_page();
	};
	
	this.change_account_settings_input = function(e) {
		app.data[e.target.name] = e.target.value;
		window.localStorage.setItem(e.target.name, e.target.value);
		app.update_display_page();
	};

    // Genaral

    this.main_loop_interval = function() {

        while ((app.ui_action_in_progress == null) && app.ui_action_stack.count() > 0) {
            next_action = app.ui_action_stack.shift();
            next_action.execute();
        }
    };

    this.run = function() {
		app = this;
		
		storage = window.localStorage;
		
		app.data['recipient'] = (storage.recipient) ? storage.recipient : 'Wikimedia Foerdergesellschaft';
		app.data['bic'] = (storage.bic) ? storage.bic : 'BFSWDE33BER';
		app.data['iban'] = (storage.iban) ? storage.iban : 'DE33100205000001194700';
		app.data['currency'] =  (storage.currency) ? storage.currency : 'EUR';
		
		app.data['subject'] = (storage.subject) ? storage.subject : 'Spende fuer Wikipedia';
		app.data['amount'] = (storage.amount) ? storage.amount : '123.45';
		
		app.update_display_page();

		e = document.getElementById('recipient_input');
		e.value = app.data['recipient'].trim();
		e.onchange = app.change_account_settings_input;
		
		e = document.getElementById('bic_input');
		e.value = app.data['bic'].trim();
		e.onchange = app.change_account_settings_input;
		
		e = document.getElementById('iban_input');
		e.value = app.data['iban'].trim();
		e.onchange = app.change_account_settings_input;
		
		e = document.getElementById('currency_input');
		e.value = app.data['currency'].trim();
		e.onchange = app.change_account_settings_input;
		
		e = document.getElementById('subject_input');
		e.value = app.data['subject'].trim();
		e.onchange = app.change_payment_settings_input;
		
		e = document.getElementById('amount_input');
		e.value = app.data['amount'].trim();
		e.onchange = app.change_payment_settings_input;

		girocode_page = document.getElementById('girocode_page');
		app.ui_active_page = girocode_page;
		girocode_btn = document.getElementById('girocode_btn');
		girocode_btn.onclick = app.click_girocode_btn;
		girocode_btn.classList.add('selected_btn');
		app.ui_active_btn = girocode_btn;
		
		payment_settings_page = document.getElementById('payment_settings_page');
		payment_settings_page.classList.add('invisible_page');
		payment_settings_page.classList.add('hidden_page');
		payment_settings_btn = document.getElementById('payment_settings_btn');
		payment_settings_btn.onclick = app.click_payment_settings_btn;
		
		bank_account_settings_page = document.getElementById('bank_account_settings_page');
		bank_account_settings_page.classList.add('invisible_page');
		bank_account_settings_page.classList.add('hidden_page');
		bank_account_settings_btn = document.getElementById('bank_account_settings_btn');
		bank_account_settings_btn.onclick = app.click_bank_account_settings_btn;
		
		setTimeout(function(){ app.main_loop_interval(); }, 20);
    };
}
