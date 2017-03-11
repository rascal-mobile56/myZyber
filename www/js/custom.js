$(document).ready(function () {      
            
    function init_template(){//Class is vital to run AJAX Pages    
        //Sidebar Settings

        $('.show-left-sidebar').click(function(){
            $('.sidebar-scroll-left').toggleClass('perspective-left'); 
            $('.sidebar-left').toggleClass('perspective-2-left'); 
            $('.page-content, .header, .footer-menu, .material-menu').toggleClass('perspective-3-left');   
            $('.share-bottom-tap-close').removeClass('share-bottom-tap-close-active');
            $('.share-bottom').removeClass('active-share-bottom'); 
            $('.show-header-menu, .show-modal-menu').toggleClass('no-pointer');
            $('.back-to-top-badge').removeClass('back-to-top-badge-visible');
            $('.header-menu').toggleClass('no-visibility');
            $('.header-menu-overlay').hide();
            $('.header-menu').removeClass('header-menu-active'); 
            $('.show-header-menu').removeClass('header-rotate');
        });  

        $('.show-right-sidebar').click(function(){        
            $('.sidebar-scroll-right').toggleClass('perspective-right'); 
            $('.sidebar-right').toggleClass('perspective-2-right'); 
            $('.page-content, .header, .footer-menu, .material-menu').toggleClass('perspective-3-right'); 
            $('.share-bottom-tap-close').removeClass('share-bottom-tap-close-active');
            $('.share-bottom').removeClass('active-share-bottom'); 
            $('.show-header-menu, .show-modal-menu').toggleClass('no-pointer');
            $('.back-to-top-badge').removeClass('back-to-top-badge-visible');
            $('.header-menu').toggleClass('no-visibility');
            $('.header-menu-overlay').hide();
            $('.header-menu').removeClass('header-menu-active'); 
            $('.show-header-menu').removeClass('header-rotate');
        });    

        $('.close-sidebar, #page-content, .menu-item, .submenu-item').not('.show-submenu').click(function(){      
            $('.sidebar-scroll-left').removeClass('perspective-left'); 
            $('.sidebar-left').removeClass('perspective-2-left'); 
            $('.page-content, .header').removeClass('perspective-3-left');
            $('.sidebar-scroll-right').removeClass('perspective-right'); 
            $('.sidebar-right').removeClass('perspective-2-right'); 
            $('.page-content, .header').removeClass('perspective-3-right'); 
            $('.footer-menu, .material-menu').removeClass('perspective-3-right'); 
            $('.footer-menu, .material-menu').removeClass('perspective-3-left'); 
            $('.show-header-menu, .show-modal-menu').removeClass('no-pointer');
            $('.header-menu').removeClass('no-visibility');
        });
                   
        var submenu_items =  $('.submenu-active').parent().find('.submenu a').length
        $('.submenu-active').toggleClass('submenu-active submenu-active-'+submenu_items);
        
        $('.show-submenu').click(function(){
           var submenu_items =  $(this).parent().find('.submenu a').length
           $(this).parent().find('.submenu').toggleClass('submenu-active submenu-active-'+submenu_items); 
           $(this).toggleClass('submenu-active');     
           return false;  
        });

        //Header Settings
        $('.show-header-menu, .close-header-menu').click(function(){
           $('.header-menu').toggleClass('header-menu-active'); 
           $('.header-menu-overlay').show();
           $('.show-header-menu').toggleClass('header-rotate');
        });
        $('.header-menu a').click(function(){
           $('.header-menu-overlay').hide();
           $('.header-menu').removeClass('header-menu-active'); 
           $('.show-header-menu').toggleClass('header-rotate');
        });    
        $('.close-header-menu, .header-menu-overlay').click(function(){
           $('.header-menu-overlay').hide();
           $('.header-menu').removeClass('header-menu-active'); 
           $('.show-header-menu').toggleClass('header-rotate');
        });

        //Material Menu Settings//
        $('.material-menu-deploy').click(function(){
           $('.material-menu-background').addClass('mm-bg');
           $('.material-menu-deploy').css('z-index', '99'); 
           $(this).parent().find('.material-menu-close').addClass('mm-c');
           $(this).parent().find('.material-menu-1').addClass('mm-1');
           $(this).parent().find('.material-menu-2').addClass('mm-2');
           $(this).parent().find('.material-menu-3').addClass('mm-3');
           $(this).parent().find('.material-menu-4').addClass('mm-4');
           $(this).parent().find('.material-menu-5').addClass('mm-5');
           $(this).parent().find('.material-menu-6').addClass('mm-6');
        });    

        $('.material-menu-close, .material-menu-background, .mm').click(function(){
            $('.material-menu-background').removeClass('mm-bg');
            setTimeout(function(){
                $('.material-menu-deploy').css('z-index', '999');  
            }, 350);
            $(this).parent().find('.material-menu-close').removeClass('mm-c');
            $(this).parent().find('.material-menu-6').removeClass('mm-6');
            $(this).parent().find('.material-menu-5').removeClass('mm-5');
            $(this).parent().find('.material-menu-4').removeClass('mm-4');
            $(this).parent().find('.material-menu-3').removeClass('mm-3');
            $(this).parent().find('.material-menu-2').removeClass('mm-2');
            $(this).parent().find('.material-menu-1').removeClass('mm-1');
        });

        //Modal Menu*/
        $('.show-modal-menu, .close-modal-menu, .modal-menu-background, .modal-menu a').click(function(){
           $('.modal-menu').toggleClass('active-modal-menu');
           $('.modal-menu-background').toggleClass('active-modal-menu-background');
           $('.show-modal-menu').toggleClass('rotate-45');
        });

        //FastClick
        $(function() {FastClick.attach(document.body);});

        //Preload Image
        $(function() {
            $(".preload-image").lazyload({
                threshold : 100,
                effect : "fadeIn",
                container: $("#page-content-scroll")
            });
        });

        //Making the slider load in the height of the image inside, no jumps*/

        //Timeout is required for sliders to iron out performance issues*/
        var swiper_store_slider = new Swiper('.store-slider', {autoplay:3000});
        var swiper_store_slider2 = new Swiper('.store-slider-2', {autoplay:3000});
        var swiper_single = new Swiper('.single-item', {autoplay:3000});
        var swiper_news_slider = new Swiper('.news-slider');
        var swiper_home_slider = new Swiper('.homepage-slider', {autoplay:3000});
        var swiper_quote_slider = new Swiper('.quote-slider', {autoplay:3000});
        var swiper_coverpage = new Swiper('.coverpage-slider', {autoplay:3000});
        var swiper_homecover = new Swiper('.homepage-cover-slider', {
            autoplay:false, 
            slidesPerView: 1,
            onSlideChangeStart:check_class,
            nextButton:'.next-home-slider',
            prevButton:'.prev-home-slider',
        });

        function check_class(){
            if(swiper_homecover.activeIndex == 1 ){
                $('.home-main-icons').addClass('show-main-icons');  
                $('.header').addClass('hide-header-icons');
            } else {
                $('.home-main-icons').removeClass('show-main-icons');
                $('.header').removeClass('hide-header-icons');
            }
        }

        var swiper_category_slider = new Swiper('.category-slider', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        slidesPerView: 5,
        spaceBetween: 20,
        breakpoints: {
            1024: {
                slidesPerView: 6,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 5,
                spaceBetween: 10
            },
            640: {
                slidesPerView: 3,
                spaceBetween: 5
            },
            320: {
                slidesPerView: 3,
                spaceBetween: 5
            }
        }
        });

        var swiper_store_thumbnail_slider = new Swiper('.store-thumbnails', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            slidesPerView: 5,
            spaceBetween: 20,
            breakpoints: {
                1024: {
                    slidesPerView: 6,
                    spaceBetween: 20
                },
                768: {
                    slidesPerView: 5,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 5
                },
                320: {
                    slidesPerView: 2,
                    spaceBetween: 5
                }
            }
        });       

        var swiper_store_thumbnail_slider = new Swiper('.circle-slider', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            slidesPerView: 3,
            spaceBetween: 20,
            breakpoints: {
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 20
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 1,
                    spaceBetween: 5
                },
                320: {
                    slidesPerView: 1,
                    spaceBetween: 5
                }
            }
        });

        var swiper_coverflow_thumbnails = new Swiper('.coverflow-thumbnails', {
            pagination: '.swiper-pagination',
            effect: 'coverflow',
            autoplay:3000,
            autoplayDisableOnInteraction: false,
            loop:true,
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            coverflow: {
                rotate: 60,
                stretch: -60,
                depth: 400,
                modifier: 1,
                slideShadows : false
            }
        });        

        var swiper_coverflow_slider = new Swiper('.coverflow-slider', {
            pagination: '.swiper-pagination',
            effect: 'coverflow',
            autoplay:3000,
            autoplayDisableOnInteraction: false,
            loop:true,
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            coverflow: {
                rotate: 60,
                stretch: -60,
                depth: 400,
                modifier: 1,
                slideShadows : false
            }
        });

        var swiper_staff_slider = new Swiper('.staff-slider', {
            nextButton: '.next-staff-slider',
            prevButton: '.prev-staff-slider',
            autoplay:3000,
            autoplayDisableOnInteraction: false,
            slidesPerView: 3,
            spaceBetween: 20,
            breakpoints: {
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 20
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 1,
                    spaceBetween: 5
                }
            }
        });


        //Mobile Style Switches
        $('.switch-1').click(function(){$(this).toggleClass('switch-1-on'); return false;});
        $('.switch-2').click(function(){$(this).toggleClass('switch-2-on'); return false;});
        $('.switch-3').click(function(){$(this).toggleClass('switch-3-on'); return false;});
        $('.switch, .switch-icon').click(function(){
            $(this).parent().find('.switch-box-content').slideToggle(250); 
            $(this).parent().find('.switch-box-subtitle').slideToggle(250);
            return false;
        });

        //Classic Toggles
        $('.toggle-title').click(function(){
            $(this).parent().find('.toggle-content').slideToggle(250); 
            $(this).find('i').toggleClass('rotate-toggle');
            return false;
        });

        //Accordion
        $('.accordion').find('.accordion-toggle').click(function(){
            //Expand or collapse this panel
            $(this).next().slideDown(250);
            $('.accordion').find('i').removeClass('rotate-180');
            $(this).find('i').addClass('rotate-180');

            //Hide the other panels
            $(".accordion-content").not($(this).next()).slideUp(250);
        });    

        //Tabs
        $('ul.tabs li').click(function(){
            var tab_id = $(this).attr('data-tab');
            $('ul.tabs li').removeClass('active-tab');
            $('.tab-content').slideUp(250);
            $(this).addClass('active-tab');
            $("#"+tab_id).slideToggle(250);
        })

        //Notifications
        $('.static-notification-close').click(function(){
           $(this).parent().slideUp(250); 
            return false;
        });    
        $('.tap-dismiss').click(function(){
           $(this).slideUp(250); 
            return false;
        });

        //Detect if iOS WebApp Engaged and permit navigation without deploying Safari
        (function(a,b,c){if(c in b&&b[c]){var d,e=a.location,f=/^(a|html)$/i;a.addEventListener("click",function(a){d=a.target;while(!f.test(d.nodeName))d=d.parentNode;"href"in d&&(d.href.indexOf("http")||~d.href.indexOf(e.host))&&(a.preventDefault(),e.href=d.href)},!1)}})(document,window.navigator,"standalone")

        //Detecting Mobiles//
        var isMobile = {
            Android: function() {return navigator.userAgent.match(/Android/i);},
            BlackBerry: function() {return navigator.userAgent.match(/BlackBerry/i);},
            iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
            Opera: function() {return navigator.userAgent.match(/Opera Mini/i);},
            Windows: function() {return navigator.userAgent.match(/IEMobile/i);},
            any: function() {return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());}
        };

        if( !isMobile.any() ){
            $('.show-blackberry, .show-ios, .show-windows, .show-android').addClass('disabled');
            $('#page-content-scroll').css('right', '0px');
            $('.show-no-detection').removeClass('disabled');
        }
        if(isMobile.Android()) {
            //Status Bar Color for Android
            $('head').append('<meta name="theme-color" content="#000000"> />');
            $('.show-android').removeClass('disabled');
            $('.show-blackberry, .show-ios, .show-windows').addClass('disabled');
            $('#page-content-scroll, .sidebar-scroll').css('right', '0px');
        }
        if(isMobile.BlackBerry()) {
            $('.show-blackberry').removeClass('disabled');
            $('.show-android, .show-ios, .show-windows').addClass('disabled');
            $('#page-content-scroll, .sidebar-scroll').css('right', '0px');
        }   
        if(isMobile.iOS()) {
            $('.show-ios').removeClass('disabled');
            $('.show-blackberry, .show-android, .show-windows').addClass('disabled');
            $('#page-content-scroll, .sidebar-scroll').css('right', '0px');
        }
        if(isMobile.Windows()) {
            $('.show-windows').removeClass('disabled');
            $('.show-blackberry, .show-ios, .show-android').addClass('disabled');
            $('#page-content-scroll, .sidebar-scroll').css('right', '0px');
        }

        //Galleries
        $(".gallery a, .show-gallery").swipebox();

        var screen_widths = $(window).width();
        if( screen_widths < 768){ 
            $('.gallery-justified').justifiedGallery({
                rowHeight : 80,
                maxRowHeight : 370,
                margins : 5,
                fixedHeight:false
            });
        };
        if( screen_widths > 768){
            $('.gallery-justified').justifiedGallery({
                rowHeight : 150,
                maxRowHeight : 370,
                margins : 5,
                fixedHeight:false
            });
        };

        //Adaptive Folios
        $('.adaptive-one').click(function(){
            $('.portfolio-switch').removeClass('active-adaptive');
            $(this).addClass('active-adaptive');
            $('.portfolio-adaptive').removeClass('portfolio-adaptive-two portfolio-adaptive-three');
            $('.portfolio-adaptive').addClass('portfolio-adaptive-one');
            return false;
        });    
        $('.adaptive-two').click(function(){
            $('.portfolio-switch').removeClass('active-adaptive');
            $(this).addClass('active-adaptive');
            $('.portfolio-adaptive').removeClass('portfolio-adaptive-one portfolio-adaptive-three');
            $('.portfolio-adaptive').addClass('portfolio-adaptive-two'); 
            return false;
        });    
        $('.adaptive-three').click(function(){
            $('.portfolio-switch').removeClass('active-adaptive');
            $(this).addClass('active-adaptive');
            $('.portfolio-adaptive').removeClass('portfolio-adaptive-two portfolio-adaptive-one');
            $('.portfolio-adaptive').addClass('portfolio-adaptive-three'); 
            return false;
        });

        //Reminders & Checklists & Tasklists
        $('.reminder-check-square').click(function(){
           $(this).toggleClass('reminder-check-square-selected'); 
            return false;
        });    
        $('.reminder-check-round').click(function(){
           $(this).toggleClass('reminder-check-round-selected'); 
            return false;
        });
        $('.checklist-square').click(function(){
           $(this).toggleClass('checklist-square-selected');
            return false;
        });    
        $('.checklist-round').click(function(){
           $(this).toggleClass('checklist-round-selected');
            return false;
        });
        $('.tasklist-incomplete').click(function(){
           $(this).removeClass('tasklist-incomplete'); 
           $(this).addClass('tasklist-completed'); 
            return false;
        });    
        $('.tasklist-item').click(function(){
           $(this).toggleClass('tasklist-completed'); 
            return false;
        });

        //SiteMap
        $('.sitemap-box a').hover(
            function(){$(this).find('i').addClass('scale-hover');}, 
            function(){$(this).find('i').removeClass('scale-hover');}
        );

        //Fullscreen Map
        $('.map-text, .overlay').click(function(){
           $('.map-text, .map-fullscreen .overlay').addClass('hide-map'); 
           $('.deactivate-map').removeClass('hide-map'); 
        });   

        $('.deactivate-map').click(function(){
           $('.map-text, .map-fullscreen .overlay').removeClass('hide-map'); 
           $('.deactivate-map').addClass('hide-map'); 
        });

        //Show Back To Home When Scrolling
        $('#page-content-scroll').on('scroll', function () {
            var total_scroll_height = $('#page-content-scroll')[0].scrollHeight
            var inside_header = ($(this).scrollTop() <= 200);
            var passed_header = ($(this).scrollTop() >= 0); //250
            var footer_reached = ($(this).scrollTop() >= (total_scroll_height - ($(window).height() +100 )));

            if (inside_header == true) {
                $('.back-to-top-badge').removeClass('back-to-top-badge-visible');
            } else if (passed_header == true)  {
                $('.back-to-top-badge').addClass('back-to-top-badge-visible');
            } 
            if (footer_reached == true){            
                //$('.back-to-top-badge').removeClass('back-to-top-badge-visible');
            }
        });

        //Back to top Badge
        $('.back-to-top-badge, .back-to-top').click(function (e) {
            e.preventDefault();
            $('#page-content-scroll').animate({
                scrollTop: 0
            }, 250);
        });     


        //Set inputs to today's date by adding class set-day
        var set_input_now = new Date();
        var set_input_month = (set_input_now.getMonth() + 1);               
        var set_input_day = set_input_now.getDate();
        if(set_input_month < 10) 
            set_input_month = "0" + set_input_month;
        if(set_input_day < 10) 
            set_input_day = "0" + set_input_day;
        var set_input_today = set_input_now.getFullYear() + '-' + set_input_month + '-' + set_input_day;
        $('.set-today').val(set_input_today);

        //Portfolios and Gallerties
        $('.adaptive-one').click(function(){
            $('.portfolio-switch').removeClass('active-adaptive');
            $(this).addClass('active-adaptive');
            $('.portfolio-adaptive').removeClass('portfolio-adaptive-two portfolio-adaptive-three');
            $('.portfolio-adaptive').addClass('portfolio-adaptive-one');
            return false;
        });    
        $('.adaptive-two').click(function(){
            $('.portfolio-switch').removeClass('active-adaptive');
            $(this).addClass('active-adaptive');
            $('.portfolio-adaptive').removeClass('portfolio-adaptive-one portfolio-adaptive-three');
            $('.portfolio-adaptive').addClass('portfolio-adaptive-two'); 
            return false;
        });    
        $('.adaptive-three').click(function(){
            $('.portfolio-switch').removeClass('active-adaptive');
            $(this).addClass('active-adaptive');
            $('.portfolio-adaptive').removeClass('portfolio-adaptive-two portfolio-adaptive-one');
            $('.portfolio-adaptive').addClass('portfolio-adaptive-three'); 
            return false;
        });

        //Wide Portfolio
        $('.show-wide-text').click(function(){
            $(this).parent().find('.wide-text').slideToggle(200); 
            return false;
        });
        $('.portfolio-close').click(function(){
           $(this).parent().parent().find('.wide-text').slideToggle(200);
            return false;
        });

        //Bottom Share Fly-up    
        $('body').append('<div class="share-bottom-tap-close"></div>');
        $('.show-share-bottom, .show-share-box').click(function(){
            $('.share-bottom-tap-close').addClass('share-bottom-tap-close-active');
            $('.share-bottom').toggleClass('active-share-bottom'); 
            return false;
        });    
        $('.close-share-bottom, .share-bottom-tap-close').click(function(){
           $('.share-bottom-tap-close').removeClass('share-bottom-tap-close-active');
           $('.share-bottom').removeClass('active-share-bottom'); 
            return false;
        });

        //Filterable Gallery
        var selectedClass = "";
        $(".filter-category").click(function(){
            $('.portfolio-filter-categories a').removeClass('selected-filter');
            $(this).addClass('selected-filter');
            selectedClass = $(this).attr("data-rel");
            $(".portfolio-filter-wrapper").slideDown(250);
            $(".portfolio-filter-wrapper div").not("."+selectedClass).delay(100).slideUp(250);
            //Timeout for events arrangements. Timeout is such a small value you won't sense it but the code will.
            setTimeout(function() {
                $("."+selectedClass).slideDown(250);
                $(".portfolio-filter-wrapper").slideDown(250);
            }, 0);
        });

        if($('body').hasClass('has-footer-menu')){
            $('.back-to-top-badge').addClass('over-footer-menu');
        };


        var screen_height = 0;
        var screen_width = 0;

        var cover_content_height = 0;
        var cover_content_width = 0;

        //Coverpage Calculations
        function calculate_covers(){
            var screen_height = $('#page-content').height()-60;
            var screen_width = $('#page-content').width();

            //Settings for Cover Pages
            var cover_content_height = $('.cover-page-content').height()-60;
            var cover_content_width = $('.cover-page-content').width();

            $('.cover-page').css('height', screen_height);
            $('.cover-page').css('width', screen_width);            
            $('.cover-page-content').css('margin-left', (cover_content_width/2)*(-1));
            $('.cover-page-content').css('margin-top', (cover_content_height/2)*(-1)-40);

            var cover_width = $(window).width();
            var cover_height = $(window).height() - 60;
            var cover_vertical = -($('.cover-center').height())/2;
            var cover_horizontal = -($('.cover-center').width())/2;

            $('.cover-screen').css('width', cover_width);
            $('.cover-screen').css('height', cover_height);
            $('.cover-screen .overlay').css('width', cover_width);
            $('.cover-screen .overlay').css('height', cover_height);
            $('.cover-center').css('margin-left', cover_horizontal);      
            $('.cover-center').css('margin-top', cover_vertical);     
            $('.cover-left').css('margin-top', cover_vertical);   
            $('.cover-right').css('margin-top', cover_vertical);                    
        };

        function calculate_lockscreen(){
            var lock_height = $('.lockscreen-header').height();
            var lock_button = $('.lockscreen-home').height();
            var lock_window = $(window).height() -60;
            var lock_total  = lock_window - (lock_button + lock_height);
            $('.lockscreen-notifications').css('height', lock_total -160);   
        }

       //Homepage Calculations
        function calculate_home(){
            var screen_height = $('#page-content').height();
            var screen_width = $('#page-content').width();

            var total_height = screen_height-220;
            var five_rows = total_height / 5;
            var four_rows = total_height / 4;
            var three_rows = total_height / 3;

            var five_columns = screen_width/5;
            var four_columns = screen_width/4;
            var three_columns = screen_width/3;

            var icon_size_five = five_rows/5;
            var icon_size_four = four_rows/4;
            var icon_size_three = three_rows/3;

            $('.five-rows a').css('height', five_rows);
            $('.five-rows a').css('padding-top', (five_rows/2)-icon_size_five);
            $('.five-rows strong').css('margin-top', (five_rows/2)-icon_size_five);

            $('.four-rows a').css('height', four_rows);
            $('.four-rows a').css('padding-top', (four_rows/2)-icon_size_four);
            $('.four-rows strong').css('margin-top', (four_rows/2)-icon_size_four);

            $('.three-rows a').css('height', three_rows);       
            $('.three-rows a').css('padding-top', (three_rows/2)-icon_size_three);
            $('.three-rows strong').css('margin-top', (three_rows/2)-icon_size_three);

            $('.five-columns a').css('width', five_columns);
            $('.four-columns a').css('width', four_columns);
            $('.three-columns a').css('width', three_columns);

            var home_intro_width = $('.home-intro').width()*(-1);
            var home_intro_height = $('.home-intro').height()*(-1);

            $('.home-intro').css('margin-left', home_intro_width/2);
            $('.home-intro').css('margin-top', home_intro_height/2);            

            var home_outro_width = $('.home-outro').width()*(-1);
            var home_outro_height = $('.home-outro').height()*(-1);

            $('.home-outro').css('margin-left', home_outro_width/2);
            $('.home-outro').css('margin-top', home_outro_height/2);

            if($('.home-slide-icons a').find("strong").length > 0){
                $('.home-slide-icons a i').css('pointer-events', 'none');   
            };

            $(".home-social a").hover(
                function() {$(this).addClass('hover-icon-effect');}, 
                function() {$(this).removeClass('hover-icon-effect');}
            );            

            $(".home-slide-icons a").hover(
                function(){$(this).find('i').addClass('hover-icon-effect'); $(this).find('strong').addClass('hover-icon-effect');}, 
                function(){$(this).find('i').removeClass('hover-icon-effect'); $(this).find('strong').removeClass('hover-icon-effect');}
            );
        };        

        function calculate_map(){
            var map_width = $(window).width();
            var map_height = $(window).height();
            $('.map-fullscreen iframe').css('width', map_width);
            $('.map-fullscreen iframe').css('height', map_height);
        };    
        
        calculate_home();
        calculate_covers();
        calculate_map();
        calculate_lockscreen();

        $( window ).resize(function() {
            calculate_covers();
            calculate_home();
            calculate_map();
            calculate_lockscreen();
        });

        //Demo Purposes
        $('.error-page-layout-switch').click(function(){
           $('.cover-page-content').toggleClass('unboxed-layout, boxed-layout'); 
            calculate_covers();
        });
        $('.landing-homepage').css('min-height', $(window).height());

        //Countdown Timer
        $(function() {
            $('.countdown-class').countdown({
                date: "June 7, 2087 15:03:26"
            });
        });

        //Copyright Year 
        if ($("#copyright-year")[0]){
            document.getElementById('copyright-year').appendChild(document.createTextNode(new Date().getFullYear()))
        }        
        if ($("#copyright-year-2")[0]){
            document.getElementById('copyright-year-2').appendChild(document.createTextNode(new Date().getFullYear()))
        }    

        //Loading Thumb Layout for News, 10 articles at a time
        $(function(){
            $(".thumb-layout-page a").slice(0, 5).show(); // select the first ten
            $(".load-more-thumbs").click(function(e){ // click event for load more
                e.preventDefault();
                $(".thumb-layout-page a:hidden").slice(0, 5).show(0); // select next 10 hidden divs and show them
                if($(".thumb-layout-page a:hidden").length == 0){ // check if any hidden divs still exist
                    $(this).hide();
                }
            });
        });

        $(function(){
            $(".card-large-layout-page .card-large-layout").slice(0, 2).show(); // select the first ten
            $(".load-more-large-cards").click(function(e){ // click event for load more
                e.preventDefault();
                $(".card-large-layout-page .card-large-layout:hidden").slice(0, 2).show(0); // select next 10 hidden divs and show them
                if($(".card-large-layout-page div:hidden").length == 0){ // check if any hidden divs still exist
                    $(this).hide();
                }
            });
        });    

        $(function(){
            $(".card-small-layout-page .card-small-layout").slice(0, 3).show(); // select the first ten
            $(".load-more-small-cards").click(function(e){ // click event for load more
                e.preventDefault();
                $(".card-small-layout-page .card-small-layout:hidden").slice(0, 3).show(0); // select next 10 hidden divs and show them
                if($(".card-small-layout-page a:hidden").length == 0){ // check if any hidden divs still exist
                    $(this).hide();
                }
            });
        });

        //News Tabs
        $('.activate-tab-1').click(function(){
            $('#tab-2, #tab-3').slideUp(250); $('#tab-1').slideDown(250);
            $('.home-tabs a').removeClass('active-home-tab');
            $('.activate-tab-1').addClass('active-home-tab');
            return false;
        });    
        $('.activate-tab-2').click(function(){
            $('#tab-1, #tab-3').slideUp(250); $('#tab-2').slideDown(250);
            $('.home-tabs a').removeClass('active-home-tab');
            $('.activate-tab-2').addClass('active-home-tab');
            return false;
        });    
        $('.activate-tab-3').click(function(){
            $('#tab-1, #tab-2').slideUp(250); $('#tab-3').slideDown(250);
            $('.home-tabs a').removeClass('active-home-tab');
            $('.activate-tab-3').addClass('active-home-tab');
            return false;
        });  

        //Store Cart Add / Substract Numbers
        $(function () {
            $('.add-qty').on('click',function(){
                var $qty=$(this).closest('div').find('.qty');
                var currentVal = parseInt($qty.val());
                if (!isNaN(currentVal)) {
                    $qty.val(currentVal + 1);
                }
            });
            $('.substract-qty').on('click',function(){
                var $qty=$(this).closest('div').find('.qty');
                var currentVal = parseInt($qty.val());
                if (!isNaN(currentVal) && currentVal > 0) {
                    $qty.val(currentVal - 1);
                }
            });
        });

        $('.remove-cart-item').click(function(){
            $(this).parent().parent().slideUp(250); 
        });

        //Tutorial Click
        if (typeof window.sessionStorage != undefined) {
            if (!sessionStorage.getItem('enabled_cookie1')) {
                $('.tutorial').show();
                sessionStorage.setItem('enabled_cookie1', true);
                sessionStorage.setItem('storedWhen', (new Date()).getTime());
            }
        }

        var formSubmitted="false";jQuery(document).ready(function(e){function t(t,n){formSubmitted="true";var r=e("#"+t).serialize();e.post(e("#"+t).attr("action"),r,function(n){e("#"+t).hide();e("#formSuccessMessageWrap").fadeIn(500)})}function n(n,r){e(".formValidationError").hide();e(".fieldHasError").removeClass("fieldHasError");e("#"+n+" .requiredField").each(function(i){if(e(this).val()==""||e(this).val()==e(this).attr("data-dummy")){e(this).val(e(this).attr("data-dummy"));e(this).focus();e(this).addClass("fieldHasError");e("#"+e(this).attr("id")+"Error").fadeIn(300);return false}if(e(this).hasClass("requiredEmailField")){var s=/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;var o="#"+e(this).attr("id");if(!s.test(e(o).val())){e(o).focus();e(o).addClass("fieldHasError");e(o+"Error2").fadeIn(300);return false}}if(formSubmitted=="false"&&i==e("#"+n+" .requiredField").length-1){t(n,r)}})}e("#formSuccessMessageWrap").hide(0);e(".formValidationError").fadeOut(0);e('input[type="text"], input[type="password"], textarea').focus(function(){if(e(this).val()==e(this).attr("data-dummy")){e(this).val("")}});e("input, textarea").blur(function(){if(e(this).val()==""){e(this).val(e(this).attr("data-dummy"))}});e("#contactSubmitButton").click(function(){n(e(this).attr("data-formId"));return false})})

        //Lockscreen

        new Date($.now());
        var dt = new Date();
        var time = dt.getHours() + ":" + ("0" + dt.getMinutes()).substr(-2);;
        $(".lockscreen-header h3").html(time);
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var d = new Date();
        var today_day = d.getDate();
        var today_year = d.getFullYear();
        var dateString = today_day;
        var daysOfWeek = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
        var today_weekday = daysOfWeek[new Date(dateString).getDay()];    

        $(".lockscreen-header p").html(today_weekday + ", " + today_day + "  " + monthNames[d.getMonth()] + "  " + today_year);

        //Dial Screen
        $('.phone-pad-1').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '1');});
        $('.phone-pad-2').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '2');});
        $('.phone-pad-3').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '3');});
        $('.phone-pad-4').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '4');});
        $('.phone-pad-5').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '5');});
        $('.phone-pad-6').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '6');});
        $('.phone-pad-7').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '7');});
        $('.phone-pad-8').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '8');});
        $('.phone-pad-9').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '9');});
        $('.phone-pad-0').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '0');});
        $('.phone-pad-star').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '*');});
        $('.phone-pad-hash').click(function(){var this_value = $('.phone-dial').val(); $('.phone-dial').val(this_value + '#');});

        $('.phone-call').click(function(){
            $('.dial-interface').toggleClass('scale-phone');
            $('.call-interface').toggleClass('scale-phone');
            $(this).toggleClass('rotate-phone');
        });
        
        $('.phone-dial').click(function(){
           $('.phone-dial').val(''); 
        });
        
        //Contacts
        $('.contact-title').click(function(){
           $(this).parent().find('.contact-information').addClass('show-contact-information'); 
        });        
        
        $('.hide-contact-information').click(function(){
           $('.contact-information').removeClass('show-contact-information'); 
        });
        
    }//Init Template Function

    
    setTimeout(init_template, 0);//Activating all the plugins
    

    $(function(){
      'use strict';
      var options = {
        prefetch: false,
        cacheLength: 0,
        blacklist: '.default-link',
        forms: 'contactForm',
        onStart: {
          duration:600, // Duration of our animation
          render: function ($container) {
            // Add your CSS animation reversing class
            $container.addClass('is-exiting');

            // Restart your animation
            smoothState.restartCSSAnimations();
            $('.page-preloader').addClass('show-preloader');
            $('#page-content, .landing-page').removeClass('show-containers');
          }
        },
        onReady: {
          duration: 0,
          render: function ($container, $newContent) {
            // Remove your CSS animation reversing class
            $container.removeClass('is-exiting');

            // Inject the new content
            $container.html($newContent);
            $('.page-preloader').addClass('show-preloader');
            $('#page-content, .landing-page').removeClass('fadeIn');
          }
        },

        onAfter: function($container, $newContent) {
            setTimeout(init_template, 0)//Timeout required to properly initiate all JS Functions. 
            $('.page-preloader').removeClass('show-preloader');
            $('#page-content, .landing-page').addClass('fadeIn show-containers');
        }
      };
      var smoothState = $('#page-transitions').smoothState(options).data('smoothState');
    });

    $('#page-content, .landing-page').addClass('fadeIn show-containers');
    
});