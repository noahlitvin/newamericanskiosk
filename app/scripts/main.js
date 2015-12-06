Handlebars.registerHelper('I18n',
  function(str){
    return $.i18n(str);
  }
);
$.i18n({locale: 'en'}).load( {
    en: 'i18n/en.json',
    es: 'i18n/es.json',
    zh: 'i18n/zh.json',
    ar: 'i18n/ar.json'
} );

app = {};

app.steps = [
    "ScreensaverView",
    "ChooseLanguageView",
    "WelcomeView",
    "OriginView",
    "ConcernsView",
    "BankView",
    "CreditView",
    "DoneView"
];

app.currentStep = 0;

$(window).load(function() {
    app.Router = new app.NewAmericansKioskRouter();
    app.User = new app.NewAmericansKioskUser();
    app.View = new app.NewAmericansKioskView({model: app.User});

    app.Router.on('route:gotostep', function( step ){ 
        app.currentStep = step;
        app.View.renderCurrentStep();
    });

    Backbone.history.start();
});

app.NewAmericansKioskRouter = Backbone.Router.extend({
    routes: {
        "step/:id": "gotostep"
    }
});

app.NewAmericansKioskUser = Backbone.Model.extend({
  initialize: function(){
    this.on("change:locale", function(model){
      $.i18n({
        locale: model.get('locale')
      });
    });
  }
});

app.NewAmericansKioskView = Backbone.View.extend({
  initialize: function(options){
    this.model = options.model;
    this.$el = $(".container");
    this.renderCurrentStep();

    var avatarView = new app.AvatarView({parent: this, model: this.model});
  },

  nextStep: function() {
    app.currentStep++;
    this.renderCurrentStep();
  },

  renderCurrentStep: function() {
    var currentView = new app[app.steps[app.currentStep]]({parent: this});
    currentView.render();
    app.Router.navigate('step/' + app.currentStep);
  },

  print: function(options) {
    //if(!options.asset){
      alert('No printer is available right now. Sorry!');
      return;
    //}
    //var target = "print/" + app.User.get('locale') + "/" + options.asset
    //var w = window.open(target);
    //w.print();
  }

});

app.AvatarView = Backbone.View.extend({
  id: "stage",

  initialize: function(options) {
    this.parent = options.parent;
    this.model = options.model;
    this.render();

    _.bindAll(this, 'update');
    this.model.bind('change', this.update);
  },

  render: function(){
    var source = $('#AvatarTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.$el.find('.character .base').load( "images/character/base.svg");
    this.parent.$el.parent().prepend(this.el);
  },

  update: function() {
    var view = this;

    _.each(this.model.changedAttributes(),function(value,key){
      switch(key) {
          case 'hairstyle':
            view.update_hairstyle(value);
            break;
          case 'haircolor':
            view.update_haircolor(value);
            break;
          case 'skin':
            view.update_skin(value);
            break;
          case 'gender':
            view.update_gender(value);
            break;
          case 'country':
            view.update_country(value);
            break;
          case 'borough':
            view.update_borough(value);
            break;
          case 'has_bank_account':
            view.update_has_bank_account(value);
            break;
      }
    });
  },

  update_hairstyle: function(newValue) {
    this.$el.find('.character .hair').load( "images/character/hair-"+newValue+".svg");
    $("#stage .character .hair").attr('data-style', newValue );
  },

  update_haircolor: function(newValue) {
    $("#stage .character .hair").attr('data-color', newValue );
  },

  update_skin: function(newValue) {
    $("#stage .character .base .st0").css('fill', newValue );
  },

  update_gender: function(newValue) {
    $("#stage .character .base").attr('data-gender', newValue );
  },

  update_country: function(newValue) {
    $(".flag").removeClass('invisible').css("background-image","url('bower_components/flag-icon-css/flags/4x3/"+newValue.toLowerCase()+".svg')" );
  },

  update_borough: function(newValue) {
    $(".background").addClass('up').css("background-image","url('images/background/"+newValue.toLowerCase()+".svg')" );
  },

  update_has_bank_account: function(newValue) {
    if(newValue){
      $("#stage .bank").removeClass('invisible');
      $("#stage .safe").addClass('invisible');
    }else{
      $("#stage .bank").addClass('invisible');
      $("#stage .safe").removeClass('invisible');
    }
  }

});

app.ScreensaverView = Backbone.View.extend({
  tagName: "section",
  id: "Screensaver",
  className: "full-width",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#ScreensaverTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click": "start"
  },

  start: function() {
    this.$el.remove();
    this.parent.nextStep();
  }

});

app.ChooseLanguageView = Backbone.View.extend({
  tagName: "section",
  id: "ChooseLanguage",
  className: "full-width",

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $('#ChooseLanguageTemplate').html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.append(this.el);
  },

  events: {
    "click a": "select_langauge"
  },

  select_langauge: function(e) {
    e.preventDefault();
    app.User.set({locale: $(e.target).attr('data-locale') });
    this.$el.remove();
    this.parent.nextStep();
  }
});


app.BaseStepView = Backbone.View.extend({
  tagName: 'section',

  events: {
    "click a.print": "print",
    "click a.next": "next"
  },

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function(){
    var source = $(this.templateSelector).html();
    var template = Handlebars.compile(source);
    var html = template();
    this.$el.html(html);
    this.parent.$el.html(this.el);

    var view = this;
    _.defer(function(){
      view.afterRender();
    });
  },

  afterRender: function(){},

  print: function(e){
    if(e){
      e.preventDefault();   
    }
    this.parent.print({asset: $(e.target).attr('data-print')});
  },

  next: function(e) {
    if(e){
      e.preventDefault();   
    }
    this.$el.remove();
    this.parent.nextStep();
  }

});

app.WelcomeView = app.BaseStepView.extend({
  id: "Welcome",
  templateSelector: "#WelcomeTemplate",

  events: function(){
    return _.extend({},app.BaseStepView.prototype.events,{
      "click .close-modal": "close_modal",
      "click .gender": "select_gender",
      "click .hairstyle": "select_hairstyle",
      "click .haircolor": "select_haircolor"
    });
  },

  close_modal: function(e) {
    e.preventDefault();
    $(e.target).parents('.modal-wrap').fadeOut();
  },

  afterRender: function() {
    this.$el.find('input[type="range"]').rangeslider({
      polyfill: false,
      onSlide: function(position, value) {

        function colorBetween(color2,color1,ratio) {
          var hex = function(x) {
              x = x.toString(16);
              return (x.length == 1) ? '0' + x : x;
          };
          
          var r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
          var g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
          var b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));
          
          return hex(r) + hex(g) + hex(b);
        }

        var color;
        if(value < 25){
          value = value * 4 / 100;
          color = colorBetween('F8D8C6','D8B096',value);
        }else if(value < 50){
          value = (value - 25) * 4 / 100;
          color = colorBetween('D8B096','d9a776',value);
        }else if(value < 75){
          value = (value - 50) * 4 / 100;
          color = colorBetween('d9a776','8a4b2a',value);
        }else{
          value = (value - 75) * 4 / 100;
          color = colorBetween('8a4b2a','43230d',value);
        }
        color = "#" + color;

        this.$handle.css('background-color', color);
        app.User.set({skin: color });
      }
    }).change();
  },

  select_gender: function (e){
    e.preventDefault();
    this.$el.find(".button.gender").removeClass('selected');
    $(e.target).addClass('selected');
    app.User.set({gender: $(e.target).attr('data-gender') });
    this.$el.find('.hairstyle-wrap').removeClass('hide');
  },

  select_hairstyle: function (e){
    e.preventDefault();
    this.$el.find(".button.hairstyle").removeClass('selected');
    $(e.target).addClass('selected');
    app.User.set({hairstyle: $(e.target).attr('data-hairstyle') });
    this.$el.find('.haircolor-wrap').removeClass('hide');
  },

  select_haircolor: function (e){
    e.preventDefault();
    this.$el.find(".button.haircolor").removeClass('selected');
    $(e.target).addClass('selected');
    app.User.set({haircolor: $(e.target).attr('data-haircolor') });
    this.$el.find('.skin-wrap').removeClass('hide');
    this.$el.find('.next').show();
  }

});

app.OriginView = app.BaseStepView.extend({
  id: "Origin",
  templateSelector: '#OriginTemplate',

  events: function(){
    return _.extend({},app.BaseStepView.prototype.events,{
      "click .borough": "select_borough"
    });
  },

  afterRender: function(){
    var view = this;
    view.$el.find('#select-country').selectize({
      onChange: function(value) {
        view.parent.model.set('country',value);
        view.$el.find('.borough-wrap').removeClass('hide');
      }
    });
  },

  select_borough: function(e){
    e.preventDefault();
    this.parent.model.set('borough', $(e.target).attr('data-borough') );
    this.next();
  }

});

app.ConcernsView = app.BaseStepView.extend({
  id: "Concerns",
  templateSelector: '#ConcernsTemplate',

  events: function(){
    return _.extend({},app.BaseStepView.prototype.events,{
      "click a.concern-option": "optionSelect"
    });
  },

  optionSelect: function(e){
    e.preventDefault();
    app.User.set({concerned: $(e.target).attr('data-concerned') === 'true' });
    this.$el.find('.modal-wrap .' + $(e.target).attr('data-concerned')).removeClass('hide');
    this.$el.find('.modal-wrap').removeClass('hide');
  },

});

app.BankView = app.BaseStepView.extend({
  id: "Bank",
  templateSelector: '#BankTemplate',

  events: function(){
    return _.extend({},app.BaseStepView.prototype.events,{
      "click a.bank-1-option": "option1Select",
      "click a.bank-2-option": "option2Select"
    });
  },

  option1Select: function(e){
    e.preventDefault();
    app.User.set({has_bank_account: $(e.target).attr('data-has_bank_account') === 'true' });
    this.$el.find(".bank-1-option.selected").removeClass('selected');
    $(e.target).addClass('selected');

    if(app.User.get('has_bank_account') == true){
      this.$el.find(".question-2-wrap").fadeIn();
      this.$el.find(".nyc-offerings-wrap").addClass('hide');
    }else{
      this.$el.find(".question-2-wrap").fadeOut();
      this.$el.find(".nyc-offerings-wrap").removeClass('hide');
      this.$el.find('.modal-wrap').removeClass('hide');
    }
  },

  option2Select: function(e){
    e.preventDefault();
    app.User.set({has_high_fees: $(e.target).attr('data-has_high_fees') === 'true' });
    this.$el.find(".bank-2-option.selected").removeClass('selected');
    $(e.target).addClass('selected');
    this.$el.find('.modal-wrap').removeClass('hide');
  }

});


app.CreditView = app.BaseStepView.extend({
  id: "Credit",
  templateSelector: '#CreditTemplate',

  events: function(){
    return _.extend({},app.BaseStepView.prototype.events,{
      "click a.credit-option": "optionSelect"
    });
  },

  optionSelect: function(e){
    e.preventDefault();
    app.User.set({has_credit_knowledge: $(e.target).attr('data-has_credit_knowledge') === 'true' });
    if( app.User.get('has_credit_knowledge') ){
      this.next();
    }else{
      this.$el.find('.modal-wrap').removeClass('hide');
    }
  }

});

app.DoneView = app.BaseStepView.extend({
  id: "Done",
  templateSelector: '#DoneTemplate',
  className: "full-width",

  events: function(){
    return _.extend({},app.BaseStepView.prototype.events,{
      "click": "restart"
    });
  },

  restart: function() {
    var url = [location.protocol, '//', location.host, location.pathname].join('');
    window.location.replace(url);
  }
});

