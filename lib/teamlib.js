// Generated by IcedCoffeeScript 1.8.0-e
(function() {
  var EncKeyManager, KeyManager, Nonce20, PerTeamKeyBox, PerTeamKeyBoxes, PerTeamSecretKeySet, PerTeamSecretKeys, PerUserSecretKeys, PerXSecretKeys, createHash, createHmac, derive_key, iced, kb, kbpgp, kdf, make_esc, pack, unpack, __iced_k, __iced_k_noop, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  make_esc = require('iced-error').make_esc;

  _ref = require('crypto'), createHash = _ref.createHash, createHmac = _ref.createHmac;

  kbpgp = require('kbpgp');

  kb = kbpgp.kb;

  _ref1 = kbpgp.kb, KeyManager = _ref1.KeyManager, EncKeyManager = _ref1.EncKeyManager;

  _ref2 = require('purepack'), pack = _ref2.pack, unpack = _ref2.unpack;

  exports.kdf = kdf = function(_arg) {
    var alg, context, enc, key, ret;
    key = _arg.key, context = _arg.context, alg = _arg.alg, enc = _arg.enc;
    alg || (alg = "sha512");
    if (typeof key === "string") {
      throw new Error("kdf key is string, expected buffer");
    }
    ret = createHmac(alg, key).update(context).digest().slice(0, 32);
    if (enc != null) {
      return ret.toString(enc);
    } else {
      return ret;
    }
  };

  exports.derive_key = derive_key = function(_arg) {
    var alg, context, enc, key, omit_prefix, prefix, which, who;
    key = _arg.key, who = _arg.who, which = _arg.which, omit_prefix = _arg.omit_prefix, alg = _arg.alg, enc = _arg.enc;
    prefix = omit_prefix ? "" : "Keybase-";
    context = "" + prefix + "Derived-" + who + "-NaCl-" + which + "-1";
    return kdf({
      key: key,
      context: context,
      alg: alg,
      enc: enc
    });
  };

  PerXSecretKeys = (function() {
    function PerXSecretKeys(_arg) {
      this.seed = _arg.seed, this.kms = _arg.kms, this.who = _arg.who, this.secret_box_key = _arg.secret_box_key, this.prng = _arg.prng;
      this.seed || (this.seed = this.prng(32));
      this.kms || (this.kms = {});
      this.secret_box_key || (this.secret_box_key = null);
    }

    PerXSecretKeys.prototype.get_kms = function() {
      return this.kms;
    };

    PerXSecretKeys.prototype.get_seed = function() {
      return this.seed;
    };

    PerXSecretKeys.prototype.get_secret_box_key = function() {
      return this.secret_box_key;
    };

    PerXSecretKeys.prototype.derive = function(opts, cb) {
      var alg, esc, omit_prefix, seed, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "derive");
      alg = this.who === "User" ? "sha256" : "sha512";
      omit_prefix = this.who === "User" ? true : false;
      seed = derive_key({
        key: this.seed,
        who: this.who,
        which: "EdDSA",
        omit_prefix: omit_prefix,
        alg: alg
      });
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/miles/go/src/github.com/keybase/node-forge-sigchain/src/teamlib.iced",
            funcname: "PerXSecretKeys.derive"
          });
          KeyManager.generate({
            seed: seed
          }, esc(__iced_deferrals.defer({
            assign_fn: (function(__slot_1) {
              return function() {
                return __slot_1.signing = arguments[0];
              };
            })(_this.kms),
            lineno: 43
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          seed = derive_key({
            key: _this.seed,
            who: _this.who,
            which: "DH",
            omit_prefix: omit_prefix,
            alg: alg
          });
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/miles/go/src/github.com/keybase/node-forge-sigchain/src/teamlib.iced",
              funcname: "PerXSecretKeys.derive"
            });
            EncKeyManager.generate({
              seed: seed
            }, esc(__iced_deferrals.defer({
              assign_fn: (function(__slot_1) {
                return function() {
                  return __slot_1.encryption = arguments[0];
                };
              })(_this.kms),
              lineno: 45
            })));
            __iced_deferrals._fulfill();
          })(function() {
            _this.secret_box_key = derive_key({
              key: _this.seed,
              who: _this.who,
              which: "SecretBox",
              omit_prefix: omit_prefix,
              alg: alg
            });
            return cb(null);
          });
        };
      })(this));
    };

    return PerXSecretKeys;

  })();

  exports.PerUserSecretKeys = PerUserSecretKeys = (function(_super) {
    __extends(PerUserSecretKeys, _super);

    function PerUserSecretKeys(args) {
      args.who = "User";
      PerUserSecretKeys.__super__.constructor.call(this, args);
    }

    return PerUserSecretKeys;

  })(PerXSecretKeys);

  exports.PerTeamSecretKeys = PerTeamSecretKeys = (function(_super) {
    __extends(PerTeamSecretKeys, _super);

    function PerTeamSecretKeys(args) {
      args.who = "Team";
      PerTeamSecretKeys.__super__.constructor.call(this, args);
    }

    PerTeamSecretKeys.make = function(_arg, cb) {
      var err, prng, s, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      prng = _arg.prng;
      s = new PerTeamSecretKeys({
        prng: prng
      });
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/miles/go/src/github.com/keybase/node-forge-sigchain/src/teamlib.iced",
            funcname: "PerTeamSecretKeys.make"
          });
          s.derive({}, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return err = arguments[0];
              };
            })(),
            lineno: 65
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, s);
        };
      })(this));
    };

    return PerTeamSecretKeys;

  })(PerXSecretKeys);

  exports.PerTeamSecretKeySet = PerTeamSecretKeySet = (function() {
    function PerTeamSecretKeySet(_arg) {
      this.encrypting_km = _arg.encrypting_km, this.generation = _arg.generation, this.boxes = _arg.boxes, this.prev = _arg.prev, this.encrypting_kid = _arg.encrypting_kid, this.nonce = _arg.nonce, this.prng = _arg.prng;
    }

    PerTeamSecretKeySet.prototype.prepare = function(opts, cb) {
      var esc, hex, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "prepare");
      (function(_this) {
        return (function(__iced_k) {
          if ((hex = _this.encrypting_kid) != null) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/miles/go/src/github.com/keybase/node-forge-sigchain/src/teamlib.iced",
                funcname: "PerTeamSecretKeySet.prepare"
              });
              kbpgp.kb.EncKeyManager.import_public({
                hex: hex
              }, esc(__iced_deferrals.defer({
                assign_fn: (function(__slot_1) {
                  return function() {
                    return __slot_1.encrypting_km = arguments[0];
                  };
                })(_this),
                lineno: 82
              })));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          return cb(null);
        };
      })(this));
    };

    PerTeamSecretKeySet.prototype.to_proof_arg = function(_arg) {
      var encryption_kid, ptsk_new, signing_kid;
      ptsk_new = _arg.ptsk_new;
      encryption_kid = ptsk_new.get_kms().encryption.get_ekid().toString('hex');
      signing_kid = ptsk_new.get_kms().signing.get_ekid().toString('hex');
      return new PerTeamPublicKeySet({
        generation: this.generation,
        encryption_kid: encryption_kid,
        signing_kid: signing_kid
      });
    };

    PerTeamSecretKeySet.prototype.eq = function(ks2) {
      if (this.encrypting_km && ks2.encrypting_km) {
        if (!(this.encrypting_km.eq(ks2.encrypting_km) && (this.generation === ks2.generation) && this.boxes.eq(ks2.boxes))) {
          return false;
        }
      } else if ((this.encrypting_km != null) || (ks2.encrypting_km != null)) {
        return false;
      }
      if ((this.prev != null) && (ks2.prev != null)) {
        if (!bufeq_secure(this.prev, ks2.prev)) {
          return false;
        }
      } else if ((this.prev != null) || (ks2.prev != null)) {
        return false;
      }
      if ((this.nonce != null) && (ks2.nonce != null)) {
        if (!this.nonce.top_eq(ks2.nonce)) {
          return false;
        }
      } else if ((this.nonce != null) || (ks2.nonce != null)) {
        return false;
      }
      return true;
    };

    PerTeamSecretKeySet.prototype.get_boxes = function() {
      if (this.boxes != null) {
        return this.boxes.boxes();
      } else {
        return [];
      }
    };

    PerTeamSecretKeySet.prototype.encrypt = function(_arg, cb) {
      var ctext, enc, encryptor, esc, nonce, out, ptsk_new, ptsk_prev, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      ptsk_new = _arg.ptsk_new, ptsk_prev = _arg.ptsk_prev;
      esc = make_esc(cb, "PerTeamSecretKeySet.encrypt");
      this.nonce = nonce = new Nonce20({
        prng: this.prng
      });
      enc = 'base64';
      out = {
        generation: this.generation,
        encrypting_kid: this.encrypting_km.get_ekid().toString('hex'),
        nonce: nonce.get_top().toString(enc)
      };
      if (ptsk_prev != null) {
        encryptor = nacl.alloc({
          secretKey: ptsk_new.get_secret_box_key()
        });
        ctext = encryptor.secretbox({
          plaintext: ptsk_prev.get_seed(),
          nonce: nonce.buffer()
        });
        this.prev = pack([1, nonce.buffer(), ctext]);
        out.prev = this.prev.toString(enc);
      }
      nonce = nonce.next();
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/miles/go/src/github.com/keybase/node-forge-sigchain/src/teamlib.iced",
            funcname: "PerTeamSecretKeySet.encrypt"
          });
          _this.boxes.encrypt({
            encrypting_km: _this.encrypting_km,
            nonce: nonce,
            per_team_key: ptsk_new.get_seed(),
            enc: enc
          }, esc(__iced_deferrals.defer({
            assign_fn: (function(__slot_1) {
              return function() {
                return __slot_1.boxes = arguments[0];
              };
            })(out),
            lineno: 140
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          return cb(null, out);
        };
      })(this));
    };

    return PerTeamSecretKeySet;

  })();

  exports.PerTeamKeyBox = PerTeamKeyBox = (function() {
    function PerTeamKeyBox(_arg) {
      this.uid = _arg.uid, this.per_user_key_seqno = _arg.per_user_key_seqno, this.nonce_bottom = _arg.nonce_bottom, this.box = _arg.box, this.km = _arg.km;
    }

    PerTeamKeyBox.parse_throw = function(_arg) {
      var box, uid, v;
      uid = _arg.uid, box = _arg.box;
      v = unpack(new Buffer(box, 'base64'));
      if (v.length !== 4) {
        throw MBPTKE("needed 4 elements in box for " + uid + "; got " + v.length);
      }
      if (v[0] !== 1) {
        throw MBPTKE("can only handle version=1; got " + v[0]);
      }
      if (typeof v[1] !== 'number' || v[1] <= 0) {
        throw MBPTKE("can only handle positive per_user_key_seqnos, got " + v[1]);
      }
      if (typeof v[2] !== 'number' || v[2] <= 0) {
        throw MBPTKE("can only handle positive nonce bottoms, got " + v[2]);
      }
      return new PerTeamKeyBox({
        uid: uid,
        per_user_key_seqno: v[1],
        nonce_bottom: v[2],
        box: v[3]
      });
    };

    PerTeamKeyBox.prototype.eq = function(skb2) {
      var ret;
      ret = (this.uid === skb2.uid) && (this.per_user_key_seqno === skb2.per_user_key_seqno) && (this.nonce_bottom === skb2.nonce_bottom) && bufeq_secure(this.box, skb2.box);
      return ret;
    };

    PerTeamKeyBox.prototype.export_ctext = function() {
      return this.box.toString('base64');
    };

    PerTeamKeyBox.prototype.encrypt = function(_arg, cb) {
      var box, enc, encrypting_km, esc, nonce, per_team_key, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      encrypting_km = _arg.encrypting_km, nonce = _arg.nonce, per_team_key = _arg.per_team_key, enc = _arg.enc;
      esc = make_esc(cb, "PerTeamKeyBox.encrypt");
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/miles/go/src/github.com/keybase/node-forge-sigchain/src/teamlib.iced",
            funcname: "PerTeamKeyBox.encrypt"
          });
          kb.box({
            sign_with: encrypting_km,
            nonce: nonce.buffer(),
            encrypt_for: _this.km,
            msg: per_team_key
          }, esc(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return box = arguments[0];
              };
            })(),
            lineno: 172
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          _this.box = (unpack(new Buffer(box, 'base64'))).body.ciphertext;
          _this.nonce_bottom = nonce.get_bottom();
          return cb(null, _this.pack(enc));
        };
      })(this));
    };

    PerTeamKeyBox.prototype.pack = function(enc) {
      return pack([1, this.per_user_key_seqno, this.nonce_bottom, this.box]).toString(enc);
    };

    return PerTeamKeyBox;

  })();

  exports.PerTeamKeyBoxes = PerTeamKeyBoxes = (function() {
    function PerTeamKeyBoxes(d) {
      this.d = d;
      this.d || (this.d = {});
    }

    PerTeamKeyBoxes.prototype.eq = function(skb2) {
      var k, k2, v, v2, _ref3, _ref4;
      _ref3 = this.d;
      for (k in _ref3) {
        v = _ref3[k];
        if (!(((v2 = skb2.d[k]) != null) && v.eq(v2))) {
          return false;
        }
      }
      _ref4 = skb2.d;
      for (k2 in _ref4) {
        v2 = _ref4[k2];
        if (!(((v = this.d[k2]) != null) && v.eq(v2))) {
          return false;
        }
      }
      return true;
    };

    PerTeamKeyBoxes.prototype.boxes = function() {
      var v, _, _ref3, _results;
      _ref3 = this.d;
      _results = [];
      for (_ in _ref3) {
        v = _ref3[_];
        _results.push(v);
      }
      return _results;
    };

    PerTeamKeyBoxes.prototype.add = function(b) {
      return this.d[b.uid] = b;
    };

    PerTeamKeyBoxes.prototype.encrypt = function(_arg, cb) {
      var enc, encrypting_km, esc, k, nonce, out, per_team_key, v, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      encrypting_km = _arg.encrypting_km, nonce = _arg.nonce, per_team_key = _arg.per_team_key, enc = _arg.enc;
      esc = make_esc(cb, "PerTeamKeyBoxes.encrypt");
      out = {};
      (function(_this) {
        return (function(__iced_k) {
          var _i, _k, _keys, _ref3, _results, _while;
          _ref3 = _this.d;
          _keys = (function() {
            var _results1;
            _results1 = [];
            for (_k in _ref3) {
              _results1.push(_k);
            }
            return _results1;
          })();
          _i = 0;
          _results = [];
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = function() {
              return __iced_k(_results);
            };
            _continue = function() {
              return iced.trampoline(function() {
                ++_i;
                return _while(__iced_k);
              });
            };
            _next = function(__iced_next_arg) {
              _results.push(__iced_next_arg);
              return _continue();
            };
            if (!(_i < _keys.length)) {
              return _break();
            } else {
              k = _keys[_i];
              v = _ref3[k];
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/miles/go/src/github.com/keybase/node-forge-sigchain/src/teamlib.iced",
                  funcname: "PerTeamKeyBoxes.encrypt"
                });
                v.encrypt({
                  encrypting_km: encrypting_km,
                  nonce: nonce,
                  per_team_key: per_team_key,
                  enc: enc
                }, esc(__iced_deferrals.defer({
                  assign_fn: (function(__slot_1, __slot_2) {
                    return function() {
                      return __slot_1[__slot_2] = arguments[0];
                    };
                  })(out, k),
                  lineno: 202
                })));
                __iced_deferrals._fulfill();
              })(function() {
                return _next(nonce = nonce.next());
              });
            }
          };
          _while(__iced_k);
        });
      })(this)((function(_this) {
        return function() {
          return cb(null, out);
        };
      })(this));
    };

    return PerTeamKeyBoxes;

  })();

  exports.Nonce20 = Nonce20 = (function() {
    function Nonce20(_arg) {
      this.top = _arg.top, this.i = _arg.i, this.prng = _arg.prng;
      this.top || (this.top = this.prng(20));
      this.i || (this.i = 0);
    }

    Nonce20.prototype.next = function() {
      return new Nonce20({
        top: this.top,
        i: this.i + 1
      });
    };

    Nonce20.prototype.at = function(i) {
      return new Nonce20({
        top: this.top,
        i: i
      });
    };

    Nonce20.prototype.buffer = function() {
      var bottom;
      bottom = Buffer.alloc(4);
      bottom.writeUInt32BE(this.i, 0);
      return Buffer.concat([this.top, bottom]);
    };

    Nonce20.prototype.get_top = function() {
      return this.top;
    };

    Nonce20.prototype.get_bottom = function() {
      return this.i;
    };

    Nonce20.prototype.top_eq = function(n2) {
      return bufeq_secure(this.top, n2.top);
    };

    return Nonce20;

  })();

}).call(this);
