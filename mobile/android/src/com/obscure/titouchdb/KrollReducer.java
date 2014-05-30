package com.obscure.titouchdb;

import java.util.List;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.Reducer;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class KrollReducer extends KrollProxy implements Reducer {

    private static final String LCAT = "KrollReducer";

    private static double sum(List<Object> values) {
        double sum = 0;
        for (Object value : values) {
            sum += ((Number) value).doubleValue();
        }
        return sum;
    }

    private static double count(List<Object> values, boolean rereduce) {
        long count = 0;
        if (rereduce) {
            for (Object value : values) {
                count += ((Number) value).longValue();
            }
        }
        else {
            return values != null ? values.size() : 0;
        }
        return count;
    }
    
    public static final Reducer COUNT = new Reducer() {
                                          @Override
                                          public Object reduce(List<Object> keys, List<Object> values, boolean rereduce) {
                                              return count(values, rereduce);
                                          }
                                      };

    public static final Reducer SUM   = new Reducer() {
                                          @Override
                                          public Object reduce(List<Object> keys, List<Object> values, boolean rereduce) {
                                              return sum(values);
                                          }
                                      };

    public static final Reducer STATS = new Reducer() {
                                          @Override
                                          public Object reduce(List<Object> keys, List<Object> values, boolean rereduce) {
                                              double min = Double.MAX_VALUE, max = -Double.MAX_VALUE;
                                              for (Object value : values) {
                                                  double v = ((Number) value).doubleValue();
                                                  min = Math.min(min, v);
                                                  max = Math.max(max, v);
                                              }
                                              
                                              KrollDict result = new KrollDict();
                                              result.put("sum", sum(values));
                                              result.put("min", min);
                                              result.put("max", max);
                                              result.put("count", count(values, rereduce));
                                              return result;
                                          }
                                      };

    private KrollFunction       reduce;

    public KrollReducer(KrollFunction reduce) {
        assert reduce != null;
        this.reduce = reduce;
    }

    @Override
    public Object reduce(final List<Object> keys, final List<Object> values, boolean rereduce) {
        return reduce.call(this.getKrollObject(), new Object[] { TypePreprocessor.preprocess(keys), TypePreprocessor.preprocess(values), rereduce });
    }
}
