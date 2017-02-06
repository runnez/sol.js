require 'pathname'

package = Pathname(__FILE__).dirname.join('package.json').read
version = package.match(/"version": "([\d\.]+)",/)[1]

Gem::Specification.new do |s|
  s.platform    = Gem::Platform::RUBY
  s.name        = 'sol-rails'
  s.version     = version
  s.summary     = 'Tiny JS framework for web pages to split your app ' +
                  'to independent blocks'

  s.files            = ['lib/sol.js', 'lib/sol-rails.rb', 'README.md']
  s.extra_rdoc_files = ['README.md']
  s.require_path     = 'lib'

  s.author   = 'Andrey Boldyrev'
  s.email    = 'runnez@yandex.ru'
  s.homepage = 'https://github.com/runnez/sol.js'
  s.license  = 'MIT'

  s.add_dependency 'sprockets', '>= 2'
end
