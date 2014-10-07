$('#type').tooltip();

var heart = 5000;
var welcomer = $('#welcomer');
var short_url_link = $('#short-url');
var modal_short_url = $('#modal-short-url');
var logout_link = $('#logout');
var username = $('#username');
var password = $('#password');
var hive_title = $('#hve-title');
var msg_tmp = $('#msg-tmp').html();
var old_mrk = $('#msg-tmp');
var new_mrk = $('#new-mrk');
var msg_entry = $('#hve-message');
msg_entry.focus();
var earlier = $('#hve-earlier');
var earlier_load = $('#hve-earlier-load');
var newlink = $('#hve-new-text');
var newtext = $('#hve-new-text');
var mod_body = $('#mod-body');
var mod_good = $('#mod-good');
var sub_name = $('#sub-name');
var sub_email = $('#sub-email');
var err_show = $('#err');
var main_con = $('#main-con');
var hve_load = $('#hve-load');
var hve_regin = $('#hve-regin');
var html_body = $('html, body');
var regin_icon = $('#regin-icon');
var btn_user_text = $('#btn-user-text');
var btn_post_user = $('#btn-post-user');
var btn_post_guest = $('#btn-post-guest');
function close_welcome () {
	welcomer.addClass('none');
	return false;
};
username.keyup(function (e) {
    if (e.keyCode == 13) {
    	password.focus();
        return false; 
    }
});
password.keyup(function (e) {
    if (e.keyCode == 13)
    	return regin_click();
});
sub_name.keyup(function (e) {
    if (e.keyCode == 13) {
    	sub_email.focus();
        return false; 
    }
});
sub_email.keyup(function (e) {
    if (e.keyCode == 13)
    	return submod();
});
var perm_store;
function hve_loaded () {
	if (bndl != null)
		regin_click();

	get_conversation_perm(url, function (err, perm) {
		if (err) {
			err_show.text('An error occured: ' + err).removeClass('none');
			main_con.addClass('none');
			throw err;
		}
		perm_store = perm;
		hive_title.text(perm.title)
		document.title = 'Hive | ' + perm.title;
		short_url_link.attr('href', perm.url_short);
		short_url_link.text(perm.url_short);
		modal_short_url.text(perm.url_short);
		modal_short_url.attr('href', perm.url_short);
		get_conversation_base(url,  function (err, base) {
			if (err) throw err;
			if (base.length == 0)
				welcomer.removeClass('none');
			hve_load.addClass('none');
			if (base.length == page_size)
				earlier.removeClass('none');
			for (var b = 0; b < base.length; b++)
				add_msg(base[b], false);
			setTimeout(hve_newer, heart);
		}, true);
	}, true);
};
function show_regin () {
	if (bndl != null) return post_as_user();
	hve_regin.removeClass('none');
	html_body.animate({scrollTop: hve_regin.offset().top - 30}, 200);
	username.focus();
    return false;
};
function regin_click () {
	function logged_in () {
		logout_link.removeClass('none');
		regin_icon.attr('class', 'fa fa-comment-o');
		btn_user_text.text(bndl.profile.display_name);
		return false;
	};
	if (bndl == null) {
		regin(username.val(), password.val(), function (err, creds) {
			if (err) throw err;
			hve_regin.addClass('none');
			html_body.animate({scrollTop: msg_entry.offset().top - (window.innerHeight / 3)}, 200);			
			msg_entry.focus();
			return logged_in();
		});
	} else return logged_in();
};
function logout () {
	bndl = null;
	localStorage.removeItem('hvebndl');
	logout_link.addClass('none');
	regin_icon.attr('class', 'fa fa-sign-in');
	btn_user_text.text('Register or Login');
	return false;
};
function toggle_rep (id) {
	var e = $('#' + id);
	e.toggleClass('none');
	return false;
};
var hop = 1;
function add_msg (msg, newmsg) {
	var html = msg_tmp.split('HID')          .join(hop++)
	                  .split('MID')          .join(msg.mid)
	                  .split('HMSG')         .join(msg.message)
	                  .split('HDISPLAYNAME') .join(msg.author.display_name)
	                  .split('HCREATEDAGO')  .join(msg.created_ago);
	if (newmsg) new_mrk.before(html);
	else old_mrk.after(html);
};
function disable_post () {
	msg_entry.prop('disabled', true);
	hve_regin.prop('disabled', true);
	btn_post_user.prop('disabled', true);
	btn_post_guest.prop('disabled', true);
};
function enable_post (clear) {
	msg_entry.prop('disabled', false);
	hve_regin.prop('disabled', false);
	btn_post_user.prop('disabled', false);
	btn_post_guest.prop('disabled', false);
	if (clear)
		msg_entry.val('');
	msg_entry.focus();
};
function post_as_user () {
	disable_post();
	post_message(url, msg_entry.val(), null, null, posted, false);
	return false;
};
function post_as_guest () {
	disable_post();
	post_message(url, msg_entry.val(), null, null, posted, true);
	return false;
};
function posted (err, msg) {
	if (err) {
		enable_post(false);
		throw err;
	}
	for (var m = 0; m < msg.length; m++) {
		conv.splice(0, 0, msg[m]);
		add_msg(msg[m], true);
	}
	enable_post(true);
};
function hve_earlier () {
	earlier.addClass('none');
	earlier_load.removeClass('none');
	get_older_messages(url, function (err, older) {
		earlier_load.addClass('none');
		if (err || older.length == page_size)
			earlier.removeClass('none');
		if (err) throw err;
		for (var o = 0; o < older.length; o++)
			add_msg(older[o], false);
	});
	return false;
};
var new_cache = [];
var clicked_new = false;
function hve_newer () {
	get_newer_messages(url, function (err, newer) {
		if (err) { 
			throw err;
			return setTimeout(hve_newer, heart);
		}
		if (newer.length == 0)
			return setTimeout(hve_newer, heart);
		new_cache = new_cache.concat(newer);
		if (clicked_new) {
			show_new();
			return setTimeout(hve_newer, 500);
		}
		newlink.removeClass('none');
		newtext.text('Show ' + new_cache.length + ' new message' + (new_cache.length == 1 ? '' : 's'));
		if (newer.length == page_size) return setTimeout(hve_newer, 500);
		else return setTimeout(hve_newer, heart);
	});
};
function show_new () {
	clicked_new = true;
	for (var n = 0; n < new_cache.length; n++)
		add_msg(new_cache[n], true);
	new_cache = [];
	newlink.addClass('none');
	return false;
};

function report_msg (mid, report, hid) {
	$('#' + hid).attr('class', 'none')
        .before('<p><i>Thank you for reporting this message, humans will review it shortly.</i></p>');
	report_message(url, mid, report, function (err, res) {
		if (err) throw err;
	});
	return false;
};

function submod () {
	pst('rye?', {name: sub_name.val(), email: sub_email.val()}, function (err, bdy) {
		if (err) throw err;
		mod_body.addClass('none');
		mod_good.removeClass('none');
	});
	return false;
};