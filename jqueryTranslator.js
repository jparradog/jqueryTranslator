/*
	Name: jqueryTranslator
	Author: Antonio Laguna
	Twitter: @Belelros
	Website: http://www.funcion13.com
	Version: 1.0
*/
(function($, window, document, undefined){
    var Translate = {
        initialize : function(pkg, options){
            var self = this, userLanguage = self.getUserLanguage();
            self.loaded = $.Deferred();

            self.translatable = true;

            self.options = $.extend({}, $.fn.jqTranslate.options, options);

            if (typeof pkg === 'string')
                self.packages.push(pkg);
            else
                self.packages = pkg;

            if (self.isTranslatable(userLanguage))
                self.loadLanguages();
            else
                self.translatable = false;

            return self.loaded.promise();
        },
        getUserLanguage : function(){
            var userLang = navigator.language || navigator.userLanguage;
            userLang = userLang.replace(/_/, '-').toLowerCase();

            if (userLang.length > 3){
                userLang = userLang.substring(0,3) + userLang.substring(3).toUpperCase();
                this.languages = [
                    userLang.substring(0,2),
                    userLang.substring(3).toUpperCase()
                ];
            }
            else
                this.languages = [
                    userLang
                ];

            $.fn.jqTranslate.userLang = userLang;
            return userLang;
        },
        isTranslatable : function(language){
            if (this.options.defaultLang === language) return false;
            else return (this.options.skip.indexOf(language) === -1);
        },
        loadLanguages : function(){
            var loaded = 0, maxLoad = Translate.languages.length * Translate.packages.length;
            this.translatedStrings = {};

            $.each(Translate.packages,function(i, pkg){
                var ePkg = pkg;

                $.each(Translate.languages, function (i, lang){
                    Translate.getLanguage(ePkg,lang)
                    .done(Translate.storeLangFile)
                    .always(function(){
                        loaded++;
                        if (loaded >= maxLoad) Translate.loaded.resolve();
                    });
                });
            });
        },
        getLanguage : function(pkg, language){
            var self = this, url = '';
            if (self.options.path){
                url = self.options.path + '/';
            }
            url += [pkg, language].join('-') + '.json';

            return $.ajax ({
                url : url,
                dataType : "json",
                cache : self.options.cache
            });
        },
        storeLangFile : function(data){
            $.extend(Translate.translatedStrings, data);
        },
        translate : function() {
        	var elem = $(this), key = elem.data('translate');
            if (Translate.translatable){
                if (Translate.translatedStrings[key]){
                    if (Translate.translatedStrings[key].length === undefined){
                        // The key have nested keys
                        Translate.translateElement(elem,Translate.translatedStrings[key].text);
                        delete Translate.translatedStrings[key].text;
                        elem.attr(Translate.translatedStrings[key])
                    }
                    else
                        Translate.translateElement(elem,Translate.translatedStrings[key]);
                }
            }
            if (typeof Translate.options.onComplete === 'function')
                Translate.options.onComplete.apply(this, arguments);
            return elem;
        },
        translateElement : function (elem, value){
            if (elem.is('input')) {
                if (elem.is('[placeholder]'))
                    elem.attr('placeholder', value);
                else
                    elem.val(value);
            }
            else if (elem.is('optgroup')){
                elem.attr('label', value);
            }
            else if (elem.is('img')) {
                elem.attr('alt',value);
            }
            else {
                elem.html(value);
            }
        }
    };

    $.fn.jqTranslate = function(pkg, options){
        var self = this;
        Translate.initialize(pkg, options).done(function(){
            return self.each(Translate.translate);
        });
    };
    $.fn.jqTranslate.options = {
        path : null,
        defaultLang : null,
        skip : [],
        cache : true,
        onComplete : null
    };
})(jQuery, window, document);