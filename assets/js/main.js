$(document).ready(function () {

    //var menu_h = $('.header_login').height();
    //$('.banner-slider').css({ "marginTop": menu_h });
    //$('.topCommonPadding').css({ "marginTop": menu_h });

    /*$("#jquery-accordion-menu").jqueryAccordionMenu();
    $(".colors a").click(function () {
        if ($(this).attr("class") != "default") {
            $("#jquery-accordion-menu").removeClass();
            $("#jquery-accordion-menu").addClass("jquery-accordion-menu").addClass($(this).attr("class"));
        } else {
            $("#jquery-accordion-menu").removeClass();
            $("#jquery-accordion-menu").addClass("jquery-accordion-menu");
        }
    });*/

    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.scrollup').fadeIn();
            $('.scrollup').addClass('active');
        } else {
            $('.scrollup').fadeOut();
            $('.scrollup').removeClass('active');
        }
    });

    $('.scrollup').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    });

    $('[data-toggle="tooltip"]').tooltip();

    function reposition() {
        var modal = $(this),
            dialog = modal.find('.modal-dialog');
        modal.css('display', 'block');
        dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
    }
    $('.modal').on('show.bs.modal', reposition);
    $(window).on('resize', function () {
        $('.modal:visible').each(reposition);
    });

    $(window).scroll(function () {
        var menu_h = $('.header_login').height();
        if ($(this).scrollTop() > menu_h) {
            $('.bottom_fixed_header').removeClass('active');
        } else {
            $('.bottom_fixed_header').addClass('active');
        }
        if ($(window).width() < 767) {
            $('.bottom_fixed_header').removeClass('active');
        }
    });

    


    $(window).scroll(function () {
        var banner_h = $('.banner-slider').height();
        var menu_h = $('.header_login').height();
        var filterFixed_h = $('.filterFixed').height();
        var filterTotal_h = menu_h + filterFixed_h;

        var scroll = $(window).scrollTop();
        //alert(searh_h);
        if (scroll > banner_h) {
            $(".leftFilterStickyBase").addClass('active');
            $('.leftFilterStickyBase').css({ "top": filterTotal_h });

            //$('.leftFilterSticky').css({ "top": menu_h });
            $(".sortSection").addClass('active');
            //$('.sortSection').css({ "top": menu_h });

            $(".filterFixed").addClass('active');
            $('.filterFixed').css({ "top": menu_h });

            $('.sortSection').css({ "top": filterTotal_h });
        }
        else {
            $(".leftFilterStickyBase").removeClass('active');
            $('.leftFilterStickyBase').css({ "top": "0px" });

            $(".sortSection").removeClass('active');
            $('.sortSection').css({ "top": "0px" });

        }
        if ($(window).width() < 767) {
            $(".leftFilterStickyBase").removeClass('active');

            $(".filterFixed").addClass('active');
            $('.filterFixed').css({ "top": menu_h });

            
        }


    });

    $('.banner-slider').owlCarousel({
        loop: true,
        margin: 0,
        autoplay: true,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        nav: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    });


    $(document).on('click', '#mobileCartPopupOpen', function () {
        $('#cartPopup').addClass('active');
        $('.popUp-backdrop').addClass('show');
    });

    $(document).on('click', '#cartPopupClose', function () {
        $('#cartPopup').removeClass('active');
        $('.popUp-backdrop').removeClass('show');
    });


    $(document).on('click', '#cartPopupOpen', function () {
        $('#cartPopup').addClass('active');
        $('.popUp-backdrop').addClass('show');
    });
    $(document).on('click', '#cartPopupClose', function () {
        $('#cartPopup').removeClass('active');
        $('.popUp-backdrop').removeClass('show');
    });
    $(document).on('click', '.popUp-backdrop', function () {
        $('#cartPopup').removeClass('active');
        $(this).removeClass('show');
    });


    $('#mobileNavPopupOpen').on('click', function () {
        $('.leftFilterStickyy').addClass('active');
        $('.popUp-backdrop').addClass('show');
    });
    $('.popUp-backdrop').on('click', function () {
        $('.leftFilterStickyy').removeClass('active');
        $(this).removeClass('show');
    });


    $('.mobileFiterOpen').on('click', function () {
        $('.leftFilterSticky').addClass('Leftactive');
        $('.popUp-backdrop').addClass('show');
    });
    $('.mobFilterClose').on('click', function () {
        $('.leftFilterSticky').removeClass('Leftactive');
        $('.popUp-backdrop').removeClass('show');
    });
    $('.popUp-backdrop').on('click', function () {
        $('.leftFilterSticky').removeClass('Leftactive');
        $(this).removeClass('show');
    });

    $('#mobileNavPopupOpen').on('click', function () {
        $('.leftFilterSticky').addClass('Leftactive');
        $('.popUp-backdrop').addClass('show');
        $('.leftFilterSticky').addClass('mobile-menu');
    });
    $('.mobFilterClose').on('click', function () {
        $('.leftFilterSticky').removeClass('mobile-menu');
    });
    $('.popUp-backdrop').on('click', function () {
        $('.leftFilterSticky').removeClass('mobile-menu');
    });

    $(document).on('click', '#favOpen', function () {
        $('#wishpopup').addClass('active');
        $('.popUp-backdrop').addClass('show');
    });
    $(document).on('click', '#favClose', function () {
        $('#wishpopup').removeClass('active');
        $('.popUp-backdrop').removeClass('show');
    });
    $(document).on('click', '.popUp-backdrop', function () {
        $('#wishpopup').removeClass('active');
        $(this).removeClass('show');
    });

    $('.testi-slider').owlCarousel({
        loop: true,
        margin: 0,
        autoplay: true,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        nav: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    });

    $(".accordion_head").click(function () {
        if ($('.accordion_body').is(':visible')) {
            //$(".accordion_body").slideUp();
            $(".plusminus").html('<i class="fa fa-angle-right"></i>');
        }
        if ($(this).next(".accordion_body").is(':visible')) {
            $(this).next(".accordion_body").slideUp();
            $(this).children(".plusminus").html('<i class="fa fa-angle-right"></i>');
        } else {
            $(this).next(".accordion_body").slideDown();
            $(this).children(".plusminus").html('<i class="fa fa-angle-down"></i>');
        }
    });

    $(".form-scrolling").mCustomScrollbar({
        theme: "light"
    });

    $(".attr_lebensphase ul").mCustomScrollbar({
        theme: "light"
    });


    $(".verTrigger").click(function(){
        $(".versanddetails").slideToggle(500);
    });

    //header scroller
    $('.header-slider').owlCarousel({
        loop: true,
        margin:0,
        autoplay: true,
        autoplayTimeout: 8000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
        mouseDrag: true,
        touchDrag: true,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        nav: true,
        responsive: {
            0: {
                items: 2
            },
            576: {
                items: 2
            },
            1000: {
                items: 2
            }
        }
    });

    //category scroller
    $('.category-slider').owlCarousel({
        loop: true,
        margin:0,
        autoplay: true,
        mouseDrag: true,
        touchDrag: true,
        autoplayTimeout: 8000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        nav: true,
        responsive: {
            0: {
                items: 2
            },
            600: {
                items: 2
            },
            1000: {
                items: 2
            }
        }
    });

    //sub-category scroller
    $('.sub-category-slider').owlCarousel({
        loop: true,
        margin: 0,
        autoplay: false,
        mouseDrag: false,
        touchDrag: false,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        nav: true,
        responsive: {
            0: {
                items: 2
            },
            600: {
                items: 2
            },
            1000: {
                items: 2
            }
        }
    });

    //advert scroller
    $('.advert-slider').owlCarousel({
        loop: true,
        margin:0,
        autoplay: true,
        mouseDrag: true,
        touchDrag: true,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        smartSpeed: 1000,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        nav: false,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    });

});


/*$(document).on('click', '.support_send', function(e) {
     console.log('test');
    var form_data = new FormData($('form#supportForm')[0]); 
    
    $.ajax({
            type: 'POST',            
            dataType: 'JSON',            
            //url: 'http://52.31.52.106/swiss/zoocial-sdk/index.php',
            url: 'https://zoocial.ch/supportupload',
            data: form_data,
            success: function(res) {
                if (res) {
                    console.log(res);                }
            }
        });
        return false;   
});*/

$(window).on('load', function () {
    $(".form-scrolling").mCustomScrollbar({
        theme: "light"
    });
    $(".weight").mCustomScrollbar({
        theme: "light"
    });
    $(".leftFilterSticky").mCustomScrollbar({
        theme: "light"
    });

});

//vertical menu
jQuery(document).ready(function($) {
    var menu_h = $('.header_login').height();
    var contentSections = $('.homeSection'),
        navigationItems = $('#right-menu li a');
    updateNavigation();
    $(window).on('scroll', function() {
        updateNavigation();
    });

    //smooth scroll to the section
    navigationItems.on('click', function(event) {
        event.preventDefault();
        smoothScroll($(this.hash));
    });

    function updateNavigation() {
        contentSections.each(function() {
            $this = $(this);
            var activeSection = $('#right-menu li a[href="#' + $this.attr('id') + '"]').data('number') - 1;
            if (($this.offset().top - $(window).height() / 2 < $(window).scrollTop()) && ($this.offset().top + $this.height() - $(window).height() / 2 > $(window).scrollTop())) {
                navigationItems.eq(activeSection).addClass('is-selected');
            } else {
                navigationItems.eq(activeSection).removeClass('is-selected');
            }
        });
    }

    function smoothScroll(target) {
        $('body,html').animate({
                'scrollTop': target.offset().top - menu_h
            },
            600
        );
    }

});



jQuery('.homeStepOne .single-food-hover').addClass('borderOne')
jQuery('.secondLevel, .thirdLevel').hide().animate({opacity: '0'});
/*jQuery(document).on('click', '.pcatone', function () {
    jQuery('#right-menu li.DotOne').show(500);
    jQuery('#right-menu li.DotTwo').hide(500);
    //jQuery(this).closest('.catItem').addClass('active')
    jQuery(".borderOne").removeClass("current");
    jQuery(this).closest('.single-food-hover').addClass('current')
    var getOpenItem = jQuery(this).attr('data-id');
    var menu_h = $('.header_login').height();
    var stepone = jQuery('.homeStepOne');
    var steptwo = jQuery('.homeStepTwo');
    //stepone.addClass('active');
    setTimeout(function(){ jQuery('html,body').animate({scrollTop: steptwo.offset().top - menu_h },'slow'); }, 500);
    jQuery('.secondLevel, .thirdLevel').removeClass('active').hide().animate({opacity: '0'});
    jQuery('#'+getOpenItem).addClass('active').show().animate({opacity: '1'});
    jQuery('.header-slider').css({opacity: 1});
    jQuery('.owl-item').find('.item').removeClass('active');
    jQuery('.owl-item').find('.'+getOpenItem).addClass('active');
    console.log(getOpenItem);
});*/

jQuery('.homeStepTwo .single-food-hover').addClass('borderTwo')
/*jQuery(document).on('click', '.pcatwo', function () {
    jQuery('#right-menu li.DotTwo').show(500);
    //jQuery(this).closest('.catItem').addClass('active')
    jQuery(".borderTwo").removeClass("current");
    jQuery(this).closest('.single-food-hover').addClass('current')
    //jQuery('.catItem').addClass('active')
    var getOpenItem = jQuery(this).attr('data-id');
    var menu_h = $('.header_login').height();
    var steptwo = jQuery('.homeStepTwo');
    var stepThree = jQuery('.homeStepThree');
    //steptwo.addClass('active');
    setTimeout(function(){ jQuery('html,body').animate({scrollTop: stepThree.offset().top - menu_h },'slow'); }, 500);
    jQuery('.thirdLevel').removeClass('active').hide().animate({opacity: '0'});
    jQuery('#'+getOpenItem).addClass('active').show().animate({opacity: '1'});
    console.log(getOpenItem);
});*/


jQuery(document).on('click', '.FilterToggle', function () {
    if(!jQuery(this).parents().hasClass('open')){
        jQuery('.Filter-toggle-content').removeClass('open');    
    }
    jQuery(this).parent().addClass('open');
});

var mouse_is_inside = false;
jQuery(document).ready(function()
{
    jQuery('.Filter-toggle-content').hover(function(){ 
        mouse_is_inside=true; 
    }, function(){ 
        mouse_is_inside=false; 
    });

    jQuery("body").mouseup(function(){ 
        if(! mouse_is_inside) jQuery('.Filter-toggle-content.open').removeClass('open'); 
    });
});

jQuery(document).on('click', '.Filter-toggle-content.open .FilterToggle', function () {
    jQuery('.Filter-toggle-content').removeClass('open');
});

jQuery(document).on('keyup', '#myInput1', function() {
    var filter = jQuery('#myInput1').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase1 li").hide();
    jQuery("#attr_lebensphase1 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput2', function() {
    var filter = jQuery('#myInput2').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase2 li").hide();
    jQuery("#attr_lebensphase2 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput3', function() {
    var filter = jQuery('#myInput3').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase3 li").hide();
    jQuery("#attr_lebensphase3 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput4', function() {
    var filter = jQuery('#myInput4').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase4 li").hide();
    jQuery("#attr_lebensphase4 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput5', function() {
    var filter = jQuery('#myInput5').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase5 li").hide();
    jQuery("#attr_lebensphase5 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput6', function() {
    var filter = jQuery('#myInput6').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase6 li").hide();
    jQuery("#attr_lebensphase6 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput7', function() {
    var filter = jQuery('#myInput7').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase7 li").hide();
    jQuery("#attr_lebensphase7 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput8', function() {
    var filter = jQuery('#myInput8').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase8 li").hide();
    jQuery("#attr_lebensphase8 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('keyup', '#myInput9', function() {
    var filter = jQuery('#myInput9').val();
    var val = filter.toLowerCase();
    jQuery("#attr_lebensphase9 li").hide();
    jQuery("#attr_lebensphase9 li").each(function() {
        var text = jQuery(this).text().toLowerCase();
        if (text.indexOf(val) != -1) {
            jQuery(this).show();
        }
    });
});

jQuery(document).on('click', '.card-header', function () {
    ///var menu_h = $('.header_login').height();
    var scrollTocardHeader = jQuery(this);
    setTimeout(function(){ jQuery('html,body').animate({scrollTop: scrollTocardHeader.offset().top },'slow'); }, 500);
});

jQuery(document).on('click', '.OpenVerdasd', function () {
    var menu_h = $('.header_login').height();
    var scrollTocardHeader = jQuery("#headingFour");
    jQuery("#collapseThree").removeClass("show");
    jQuery("#collapseFour").addClass("show");
    setTimeout(function(){ jQuery('html,body').animate({scrollTop: scrollTocardHeader.offset().top - menu_h},'slow'); }, 500);
});

jQuery(document).on('click', '.OpenZahlungsart', function () {
    var menu_h = $('.header_login').height();
    var scrollTocardHeader = jQuery("#headingFive");
    jQuery("#collapseFour").removeClass("show");
    jQuery("#collapseFive").addClass("show");
    setTimeout(function(){ jQuery('html,body').animate({scrollTop: scrollTocardHeader.offset().top - menu_h},'slow'); }, 500);
});

jQuery(document).on('click', '.OpenZahlungsart', function () {
    var menu_h = $('.header_login').height();
    var scrollTocardHeader = jQuery("#headingSix");
    jQuery("#collapseFive").removeClass("show");
    jQuery("#collapseSix").addClass("show");
    setTimeout(function(){ jQuery('html,body').animate({scrollTop: scrollTocardHeader.offset().top - menu_h},'slow'); }, 500);
});

jQuery(document).on('click', '.headingOne', function () {
    //jQuery(".geustOpen").slideToggle(300);
    jQuery("#collapseOne").slideToggle(300);
});
jQuery(document).on('click', '.gutscheincode a', function () {
    jQuery(".GutscheincodeOpen").slideToggle(300);
    jQuery(".gutscheincode").addClass("active");
    jQuery(this).find(".fa").addClass("fa-minus").removeClass("fa-plus");
});
jQuery(document).on('click', '.gutscheincode.active a', function () {
    jQuery(".gutscheincode.active a").find(".fa").removeClass("fa-minus").addClass("fa-plus");
    jQuery(".gutscheincode").removeClass("active");
});

jQuery(document).on('click','.AnAdresse',function(){
    var input_val = jQuery("input[name='dieseAdresse']:checked").val();
    //alert(input_val);
    if(input_val=='option2') {
        jQuery(".Lieferadresse").show();
    } else {
        jQuery(".Lieferadresse").hide();
    }
});

jQuery(document).ready(function () {
    var menu_h = jQuery('.header_login').height();
    jQuery('.about-banner').css({ "marginTop": menu_h });

    jQuery(document).on('click', '#supportPopupOpen', function () {
        jQuery('#SupportPopup').addClass('active');
        jQuery('.popUp-backdrop').addClass('show');
        jQuery('.popUp-backdrop').addClass('supportActive');
    });

    jQuery(document).on('click', '#SupportPopupClose , .popUp-backdrop.supportActive', function () {
        jQuery('#SupportPopup').removeClass('active');
        jQuery('.popUp-backdrop').removeClass('show');
        $(this).removeClass('show');
    });

    jQuery(".supportPopupContent").mCustomScrollbar({
        theme: "light"
    });

});

jQuery(document).on('click', '#pas_visible1', function() {
    var x = document.getElementById("pass1");
    if (x.type === "password") {
        x.type = "text";
        jQuery('#pas_visible1').attr('src', '/images/svg/eye1.svg');
    } else {
        x.type = "password";
        jQuery('#pas_visible1').attr('src', '/images/svg/eye2.svg');
    }
});

jQuery(document).on('click', '#pas_visible2', function() {
    var x = document.getElementById("pass2");
    if (x.type === "password") {
        x.type = "text";
        jQuery('#pas_visible2').attr('src', '/images/svg/eye1.svg');
    } else {
        x.type = "password";
        jQuery('#pas_visible2').attr('src', '/images/svg/eye2.svg');
    }
});

jQuery(document).on('click', '#pas_visible3', function() {
    var x = document.getElementById("pass3");
    if (x.type === "password") {
        x.type = "text";
        jQuery('#pas_visible3').attr('src', '/images/svg/eye1.svg');
    } else {
        x.type = "password";
        jQuery('#pas_visible3').attr('src', '/images/svg/eye2.svg');
    }
});

jQuery(document).on('click', '#pas_visible4', function() {
    var x = document.getElementById("pass4");
    if (x.type === "password") {
        x.type = "text";
        jQuery('#pas_visible4').attr('src', '/images/svg/eye1.svg');
    } else {
        x.type = "password";
        jQuery('#pas_visible4').attr('src', '/images/svg/eye2.svg');
    }
});

jQuery(document).on('click', '#pas_visible5', function() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
        jQuery('#pas_visible5').attr('src', '/images/svg/eye1.svg');
    } else {
        x.type = "password";
        jQuery('#pas_visible5').attr('src', '/images/svg/eye2.svg');
    }
});

jQuery(document).on('click', '#pas_visible6', function() {
    var x = document.getElementById("pass6");
    if (x.type === "password") {
        x.type = "text";
        jQuery('#pas_visible6').attr('src', '/images/svg/eye1.svg');
    } else {
        x.type = "password";
        jQuery('#pas_visible6').attr('src', '/images/svg/eye2.svg');
    }
});


jQuery(document).on('click', '.tabBtnToggle', function () {
    jQuery(".futtersection").slideToggle(300);
});

jQuery(document).on('click', '#faqZShop .card-header1', function () {
    var menu_h = $('.header_login').height();
    var scrollTocardHeader = jQuery(this);
    setTimeout(function(){ jQuery('html,body').animate({scrollTop: scrollTocardHeader.offset().top - menu_h - 15 },'slow'); }, 500);
});

jQuery(document).on('click', '.addNewAddress a', function () {
    $(".addNewAddressOpen").show();
    $(".addNewAddressEdit").hide();
});
jQuery(document).on('click', '.addAddressCancel', function () {
    $(".addNewAddressOpen").hide();
    $(".addNewAddressEdit").hide();
});
jQuery(document).on('click', '.editAddressTrigger', function () {
    jQuery(this).closest('.displayShippingAddress').find(".addNewAddressEdit").show();
    $(".addNewAddressOpen").hide();
});
jQuery(document).on('click', '.editAddressCancel', function () {
    jQuery(this).closest('.displayShippingAddress').find(".addNewAddressEdit").hide();
    jQuery(".addNewAddressEdit").hide();
});

jQuery(document).ready(function($) {
  
  //check to see if the submited cookie is set, if not check if the popup has been closed, if not then display the popup
  if( getCookie('popupCookie') != 'submited'){ 
    if(getCookie('popupCookie') != 'closed' ){
      $('.cookie-popup-overlay').css("display", "flex").hide().fadeIn();
    }
  }
  
  $('a.close').click(function(){
    $('.cookie-popup-overlay').fadeOut();
    //sets the coookie to one minute if the popup is closed (whole numbers = days)
    setCookie( 'popupCookie', 'closed', 30 );
  });
  
  $('a.submit').click(function(){
    $('.cookie-popup-overlay').fadeOut();
    //sets the coookie to five minutes if the popup is submited (whole numbers = days)
    setCookie( 'popupCookie', 'submited', 30 );
  });

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
});


jQuery(document).on('click', '.teilnahmebedingungenBtnToggle', function () {
    jQuery(".Teilnahmebedingungen").slideToggle(300);
});
jQuery(document).on('click', '.Teilnahmebedingungen .close', function () {
    jQuery(".Teilnahmebedingungen").slideToggle(300);
});


jQuery(document).on('click', '.DisplyRating a', function () {
    var menu_h = jQuery('.header_login').height();
    jQuery('.nav a[href="#Kundenmeinungen"]').tab('show');
    setTimeout(function(){ jQuery('html, body').animate({scrollTop: $('#Kundenmeinungen-tab').offset().top - menu_h - 15}, 'slow')}, 500);
});


jQuery(function() {
  jQuery('.addfavourite').tooltip({placement: 'right'});
});



jQuery(document).ready(function($) {
	jQuery("<span class='clearBtn'>&times;</span>").insertAfter(".product_search");
	jQuery(".clearBtn").click(function() {
	  console.log("clicked");
	  jQuery(this)
	    .prev(".product_search")
	    .val("");
	  	jQuery(this).hide();
	 	jQuery('.navSearch button').show();
	 	jQuery('.searchlisting').hide();
	});
	jQuery(document).on("input", ".product_search", function() {
	    jQuery(this)
	      .next(".clearBtn")
	      .show();
	      jQuery('.navSearch button').hide();
	});

	jQuery('.product_search').keyup(function() {
	  if (jQuery(this).val().length == 0) {
	    jQuery('.clearBtn').hide();
	    jQuery('.navSearch button').show();
	  } else {
	    jQuery('.clearBtn').show();
	  }
	}).keyup();

});


jQuery(document).ready(function () {

    jQuery(document).on('click', '.ribbon-sm span', function () {
        jQuery('#RemiPopup').addClass('active');
        jQuery('.popUp-backdrop').addClass('show');
        jQuery('.popUp-backdrop').addClass('remiActive');
    });

    jQuery(document).on('click', '#remiPopupClose , .popUp-backdrop.remiActive', function () {
        jQuery('#RemiPopup').removeClass('active');
        jQuery('.popUp-backdrop').removeClass('show');
        $(this).removeClass('show');
    });

    jQuery(".remiPopupContent").mCustomScrollbar({
        theme: "light"
    });

    jQuery(document).on('click', '#product-detail .ribbon-top-left span', function () {
        jQuery('#RemiPopup').addClass('active');
        jQuery('.popUp-backdrop').addClass('show');
        jQuery('.popUp-backdrop').addClass('remiActive');
    });

});

$(document).ready(function(){
    $('[data-toggle="popover"]').popover({
        //placement : 'top',
        trigger : 'hover'
    });
});

$('.popupover').popover();
jQuery("body").on("click touchstart", '.popupover', function() {
   $(this).popover("show");
        $('.popupover').not(this).popover("hide"); // hide other popovers
        return false;
    });
jQuery("body").on("click touchstart", function() {
    $('.popupover').popover("hide"); // hide all popovers when clicked on body
});
