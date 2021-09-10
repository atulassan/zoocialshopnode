jQuery(document).ready(function() {
    jQuery('body').append('<div id="wt-validate"><div id="wt-validate-in"></div></div>');
});
(function(jQuery) {
    jQuery.fn.validate = function(settings) {
        if (this.data('validate')) {
            return this.data('validate');
        }
        this.data('validate', this);
        var opts = jQuery.extend({
            onSuccess: false,
            onError: false,
            onValidate: false,
            onValidateMessage: false,
            validf: false,
            position: 'auto',
            tooltip: {
                error: true,
                info: true,
                hint: true
            }
        }, settings);
        var forms = this;
        initialize = function() {
            for (i = 0; i < forms.length; i++) {
                frm = forms[i];
                jQuery(frm).submit(function() {
                    checkForm(this);
                    rtn = opts.validf;
                    if (opts.onSuccess && opts.validf) rtn = opts.onSuccess(this);
                    if (opts.onError && !opts.validf) opts.onError(this);
                    return rtn;
                });
                elms = jQuery(frm).find(':input[data-valcode]');
                elms.each(function() {
                    jQuery(this).blur(function() {
                        checkField(this);
                        jQuery('#wt-validate').hide();
                        return false;
                    });
                    jQuery(this).focus(function() {
                        info = checkField(this);
                        showToolTip(this, info);
                        return false;
                    });
                    switch (this.tagName.toLowerCase()) {
                        case 'select':
                            jQuery(this).change(function() {
                                info = checkField(this);
                                showToolTip(this, info);
                                return false;
                            });
                            break;
                        case 'textarea':
                        case 'input':
                        default:
                            jQuery(this).keyup(function() {
                                info = checkField(this);
                                showToolTip(this, info);
                                return false;
                            });
                            break;
                    }
                });
            }
        }
        var checkForm = function(obj) {
            elms = jQuery(obj).find(':input[data-valcode]');
            elms.each(function() {
                info = checkField(this);
                clas = jQuery(this).parent().attr('class');
                str = '';
                title = this.getAttribute('title');
                for (i = 0; i < info.length; i++) {
                    if (!info[i][1]) str += getErrorMessage(info[i][0], title, this) + '\n';
                }
                if (str != '') {
                    //alert(str);
                    this.focus();
                    opts.validf = false;
                    return false;
                }
                opts.validf = true;
                return true;
            });
        };
        var checkField = function(obj) {
            switch (obj.tagName.toLowerCase()) {
                case 'input':
                case 'select':
                case 'textarea':
                    rval = checkInputField(obj);
                    break;
            }
            return rval;
        };
        var checkInputField = function(obj) {
            var keys = obj.getAttribute('data-valcode').split('_');
            var info = [];
            if (jQuery.inArray('b', keys) >= 0 && obj.value == '') {
                info.push(new Array("", true));
                displayInfo(obj, true);
                return info;
            }
            var valid = true;
            var flag = true;
            for (i = 0; i < keys.length; i++) {
                switch (keys[i]) {
                    case '!b':
                        valid = !isEmpty(obj.value);
                        break;
                    case 'up':
                        valid = !isEmpty(obj.value);
                        break;
                    case 's':
                        valid = isString(obj.value);
                        break;
                    case 'spl':
                        valid = isStringSpl(obj.value);
                        break;
                    case 'inc':
                        valid = isIncremental(obj.value);
                        break;
                    case 'e':
                        valid = isEmail(obj.value);
                        break;
                    case 'no':
                        valid = isNumber(obj.value);
                        break;
                    case 'fl':
                        valid = isFloat(obj.value);
                        break;
                    case 'rs':
                        valid = isAmount(obj.value);
                        break;
                    case 'sel':
                        valid = isSelected(obj);
                        break;
                    case 'ck':
                        valid = isChecked(obj);
                        break;
                    case 'dat':
                        valid = isDateFormat(obj.value);
                        break;
                    default:
                        str = keys[i];
                        if (str.substring(0, 7) == 'pas') valid = confirmPassword(obj, jQuery(obj).attr('valcode-pss'));
                        if (str.substring(0, 3) == 'max') valid = maximumLength(obj.value, jQuery(obj).attr('valcode-max'));
                        if (str.substring(0, 3) == 'min') valid = minimumLength(obj.value, jQuery(obj).attr('valcode-min'));
                        if (str.substring(0, 4) == 'wmax') valid = maximumWordLength(obj.value, jQuery(obj).attr('valcode-wmax'));
                        if (str.substring(0, 4) == 'wmin') valid = minimumWordLength(obj.value, jQuery(obj).attr('valcode-wmin'));
                        break;
                }
                if (opts.onValidate) {
                    valid = opts.onValidate(keys[i], obj, valid);
                }
                if (!valid) flag = false;
                info.push(new Array(keys[i], valid));
            }
            displayInfo(obj, flag);
            return info;
        };
        var showToolTip = function(obj, info) {
            var spos = jQuery(obj).parent().offset();
            var title = obj.getAttribute('title');
            jQuery('#wt-validate-in').empty();
            str = '';
            if (opts.tooltip.hint && jQuery(obj).data('hint')) {
                cls = 'info_hint';
                str += '<a class="' + cls + '">' + jQuery(obj).data('hint') + '</a>';
            }
            for (i = 0; i < info.length; i++) {
                /*if (info[i][1] && opts.tooltip.info) {
                    cls = 'info_ok';
                    str += '<a class="' + cls + '">' + getErrorMessage(info[i][0], title, obj) + '</a>';
                }*/
                if (!info[i][1] && opts.tooltip.error) {
                    cls = 'info_err';
                    str += '<a class="' + cls + '">' + getErrorMessage(info[i][0], title, obj) + '</a>';
                }
            }
            jQuery('#wt-validate').stop();
            if (str != '') {
                jQuery('#wt-validate-in').append(str);
                WinWidth = jQuery(window).width();
                if (WinWidth < 1240) {
                    opts.position = 'top';
                }
                if ((opts.position == 'auto' && jQuery(window).width() < (spos.left + jQuery(obj).parent().outerWidth() + jQuery('#wt-validate').outerWidth())) || opts.position == 'top') {
                    jQuery('#wt-validate').removeClass('wt-validateleft');
                    jQuery('#wt-validate').addClass('wt-validatebottom');
                    jQuery('#wt-validate').css({
                        top: spos.top - (jQuery('#wt-validate').height() + 10),
                        left: spos.left + (jQuery(obj).outerWidth() - jQuery('#wt-validate').outerWidth())
                    }).show();
                } else {
                    jQuery('#wt-validate').removeClass('wt-validatebottom');
                    jQuery('#wt-validate').addClass('wt-validateleft');
                    jQuery('#wt-validate').css({
                        top: spos.top,
                        left: spos.left + jQuery(obj).parent().outerWidth()
                    }).show();
                }
            } else {
                jQuery('#wt-validate').hide();
            }
        };
        var displayInfo = function(obj, status) {
            if (status) {
                jQuery(obj).parent().removeClass('field_info_err').addClass('field_info_ok');
                return true;
            } else {
                jQuery(obj).parent().removeClass('field_info_ok').addClass('field_info_err');
                return false;
            }
        };
        var isEmpty = function(str) {
            if (jQuery.trim(str) == '') return true;
            else
                return false;
        };
        isString = function(str) {
            var test = /[(\*\(\)\[\]\+\,\/\?\:\;\'\"\`\~\|\!\{\}\=\\#\$\%\^\&\<\>)+]/;
            if (!str.match(test)) return true;
            else
                return false;
        };
        var isStringSpl = function(str) {
            var test = /^(?=.*?[A-Za-z])(?=.*?[0-9])/;
            if (str.match(test)) return true;
            else
                return false;
        };
        var isIncremental = function(str) {
            var arstr = str.split(/([a-z]+|[A-Z]+|[0-9]+)/);
            arstr = jQuery.map(arstr, function(v) {
                return (v === "" ? null : v);
            });
            for (inx = 0; inx < arstr.length; inx++) {
                var cstr = arstr[inx];
                if (cstr.length > 2 && cstr.match(/^([a-zA-Z0-9])+$/)) {
                    var bdif = [];
                    for (jnx = 1; jnx < cstr.length; jnx++) {
                        bdif.push(cstr.charCodeAt(jnx) - cstr.charCodeAt(jnx - 1));
                    }
                    if (bdif[0] == 0 || bdif[0] == 1 || bdif[0] == -1) {
                        if (cstr.length > 1) {
                            var gflg = true;
                            for (jnx = 1; jnx < bdif.length; jnx++) {
                                if (bdif[0] != bdif[jnx]) {
                                    gflg = false;
                                }
                            }
                            if (gflg) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        var isEmail = function(str) {
            var test = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!str.match(test)) return false;
            else
                return true;
        };
        var isSelected = function(obj) {
            if (obj.value != '') return true;
            else
                return false;
        };
        var isChecked = function(obj) {
            if (obj.checked) return true;
            else
                return false;
        };
        var confirmPassword = function(obj, str) {
            obj2 = jQuery('#' + str);
            if (obj.value == obj2.val()) return true;
            else
                return false;
        };
        var isNumber = function(str) {
            var test = /^\d+$/;
            if (!str.match(test)) return false;
            else
                return true;
        };
        var isAmount = function(str) {
            var test = /^\d+\.\d+$/;
            if (!str.match(test)) return false;
            else
                return true;
        };
        var isFloat = function(str) {
            if (this.isNumber(str)) return true;
            return this.isAmount(str);
        };
        var maximumLength = function(str, len) {
            var len = parseInt(len);
            if (str.length > len) return false;
            else
                return true;
        };
        var minimumLength = function(str, len) {
            var len = parseInt(len);
            if (str.length < len) return false;
            else
                return true;
        };
        var maximumWordLength = function(str, len) {
            var len = parseInt(len);
            datas = str.match(/\S+/g);
            if (!datas) return true;
            if (datas.length > len) return false;
            else
                return true;
        };
        var minimumWordLength = function(str, len) {
            var len = parseInt(len);
            datas = str.match(/\S+/g);
            if (!datas) return false;
            if (datas.length < len) return false;
            else
                return true;
        };
        var isDateFormat = function(str) {
            var dob = /(0[1-9]|[12][0-9]|3[01])+\/(0[1-9]|1[012])+\/(19|20)\d\d/;
            if (!str.match(dob)) return false;
            else
                return true;
        };
         var getErrorMessage = function (code, title, obj) {
            var str = '';
            switch (code) {
                case '!b':
                    str = wtValidatorMsgs.notb.replace('[TITLE]', title);
                    break;
                case 'up':
                    str = wtValidatorMsgs.up.replace('[TITLE]', title);
                    break;
                case 's':
                    str = wtValidatorMsgs.s;
                    break;
                case 'spl':
                    str = wtValidatorMsgs.spl;
                    break;
                case 'rep':
                 str = wtValidatorMsgs.str;
                    break;
                case 'inc':
                     str = wtValidatorMsgs.inc;
                    break;
                case 'e':
                    str = wtValidatorMsgs.e.replace('[TITLE]', title);
                    break;
                case 'no':
                     str = wtValidatorMsgs.no;
                    break;
                case 'rs':
                    str = title + ' must be valid currency format (##.##)';
                    break;
                case 'fl':
                    str = title + ' must be valid number format (##.##)';
                    break;
                case 'sel':
                    str = 'Select a ' + title;
                    break;
                case 'ck':
                    str = 'Please check "' + title + '" checkbox';
                    break;
                case 'dat':
                    str = 'Use date format DD/MM/YYYY';
                    break;
                default:
                    if (code.substring(0, 3) == 'pas')
                        str = wtValidatorMsgs.pas;
                    if (code.substring(0, 3) == 'max')
                         str = wtValidatorMsgs.max;                      
                    if (code.substring(0, 3) == 'min')
                         str = wtValidatorMsgs.min;                        
                    if (code.substring(0, 4) == 'wmax')
                         str = wtValidatorMsgs.wmax;                       
                    if (code.substring(0, 4) == 'wmin')
                         str = wtValidatorMsgs.wmin;                      
                    break;
            }

            if (opts.onValidateMessage) {
                valid = opts.onValidateMessage(code, title);
            }
            return str;
        };
        this.iniElement = function($obj) {
            elms = $obj.find(':input[data-valcode]');
            elms.each(function() {
                jQuery(this).blur(function() {
                    checkField(this);
                    jQuery('#wt-validate').hide();
                    return false;
                });
                jQuery(this).focus(function() {
                    info = checkField(this);
                    showToolTip(this, info);
                    return false;
                });
                switch (this.tagName.toLowerCase()) {
                    case 'select':
                        jQuery(this).change(function() {
                            info = checkField(this);
                            showToolTip(this, info);
                            return false;
                        });
                        break;
                    case 'textarea':
                    case 'input':
                    default:
                        jQuery(this).keyup(function() {
                            info = checkField(this);
                            showToolTip(this, info);
                            return false;
                        });
                        break;
                }
            });
        };
        initialize();
        return this;
    }
})(jQuery);